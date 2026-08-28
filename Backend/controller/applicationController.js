const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");

const Application = require("../models/application");
const Job = require("../models/jobs");
const CandidateProfile = require("../models/candidate");
const { createNotification } = require("./notificationController");
const { extractTextFromFile } = require("../services/fileParser");
const { analyzeApplication: analyzeWithAiService } = require("../services/aiService");
const socketModule = require("../socket");


const {
    applyJobSchema,
    updateApplicationStatusSchema,
    applicationIdSchema
} = require("./validation/applicationValidation");
const {jobIdSchema}= require ("./validation/jobValidation");

const MIN_WORDS_FOR_SCORING = 20;

// skills/experience/education live on CandidateProfile, not User, so they can't
// be reached by populating `applicant` alone. Batch-load the profiles for a set
// of applicants and graft the fields onto the applicant objects the board reads.
const attachCandidateProfiles = async (applications) => {
    const applicantIds = applications
        .map((application) => application.applicant?._id)
        .filter(Boolean);

    if (applicantIds.length === 0) return applications;

    const profiles = await CandidateProfile.find({ user: { $in: applicantIds } })
        .select('user skills experience education title')
        .lean();

    const profileByUser = new Map(profiles.map((profile) => [profile.user.toString(), profile]));

    return applications.map((application) => {
        const plain = typeof application.toObject === 'function' ? application.toObject() : application;
        if (!plain.applicant?._id) return plain;

        const profile = profileByUser.get(plain.applicant._id.toString());
        plain.applicant.skills = profile?.skills ?? [];
        plain.applicant.experience = profile?.experience ?? [];
        plain.applicant.education = profile?.education ?? [];
        plain.applicant.title = profile?.title ?? '';
        return plain;
    });
};

// cvUrl is usually a server-relative path like "/uploads/cvs/cv-<id>-<suffix>.pdf",
// but may also arrive as a fully-qualified URL; parsing it resolves either form
// to the on-disk path under Backend/.
const resolveCvFilePath = (cvUrl) => {
    const { pathname } = new URL(cvUrl, "http://internal");
    const cvRoot = path.resolve(__dirname, "..", "uploads", "cvs");
    const resolved = path.resolve(__dirname, "..", pathname.replace(/^\/+/, ""));
    if (resolved !== cvRoot && !resolved.startsWith(`${cvRoot}${path.sep}`)) {
        throw new Error("Invalid CV path");
    }
    return resolved;
};

const emitAiCompleted = (recipientId, payload) => {
    if (!recipientId) return;
    try {
        socketModule.getIO().to(recipientId.toString()).emit("application_ai_completed", payload);
    } catch (error) {
        console.error("Socket emit error:", error.message);
    }
};

const markAiFailed = async (application, reason = 'Analysis failed') => {
    const shouldRetry = (application.aiAnalysis.attempts || 0) < 3;
    application.aiAnalysis.status = shouldRetry ? "pending" : "failed";
    application.aiAnalysis.lastError = reason;
    application.aiAnalysis.nextAttemptAt = shouldRetry
        ? new Date(Date.now() + (application.aiAnalysis.attempts || 1) * 30000)
        : undefined;
    await application.save();
    if (shouldRetry) return;
    emitAiCompleted(application.job.postedBy, {
        applicationId: application._id,
        status: "failed"
    });
};

const markAiCompleted = async (application, analysis) => {
    const { matchScore, matchedSkills } = analysis;
    application.aiAnalysis.matchScore = matchScore;
    application.aiAnalysis.matchedSkills = matchedSkills || [];
    application.aiAnalysis.missingRequiredSkills = analysis.missingRequiredSkills || [];
    application.aiAnalysis.requiredSkills = analysis.requiredSkills || [];
    application.aiAnalysis.requiredSkillGroups = analysis.requiredSkillGroups || [];
    application.aiAnalysis.skillMetadata = (analysis.skillMetadata || []).map((item) => ({
        canonical: item.canonical,
        preferred: item.preferred,
        conceptId: item.concept_id,
        source: item.source,
        sourceVersion: item.source_version,
        license: item.license,
        known: item.known
    }));
    application.aiAnalysis.pendingTaxonomy = analysis.pendingTaxonomy || [];
    application.aiAnalysis.scoreBreakdown = {
        requiredSkills: analysis.scoreBreakdown?.required_skills || 0,
        preferredSkills: analysis.scoreBreakdown?.preferred_skills || 0,
        experience: analysis.scoreBreakdown?.experience || 0,
        title: analysis.scoreBreakdown?.title || 0,
        semantic: analysis.scoreBreakdown?.semantic || 0,
        semanticRaw: analysis.scoreBreakdown?.semantic_raw || 0
    };
    application.aiAnalysis.requiredYears = analysis.requiredYears || 0;
    application.aiAnalysis.candidateYears = analysis.candidateYears || 0;
    application.aiAnalysis.scoringVersion = analysis.scoringVersion || '2.4';
    application.aiAnalysis.warnings = analysis.warnings || [];
    application.aiAnalysis.status = "completed";
    application.aiAnalysis.lastError = '';
    application.aiAnalysis.nextAttemptAt = undefined;
    application.aiAnalysis.processedAt = new Date();
    await application.save();
    emitAiCompleted(application.job.postedBy, {
        applicationId: application._id,
        status: "completed",
        matchScore,
        matchedSkills,
        missingRequiredSkills: analysis.missingRequiredSkills || [],
        pendingTaxonomy: application.aiAnalysis.pendingTaxonomy,
        scoreBreakdown: application.aiAnalysis.scoreBreakdown,
        requiredYears: application.aiAnalysis.requiredYears,
        candidateYears: application.aiAnalysis.candidateYears,
        scoringVersion: application.aiAnalysis.scoringVersion
    });
};

// Claims a persisted pending job atomically. It can be triggered immediately
// after submission or by the recovery worker without double-processing.
const processApplicationAI = async (applicationId) => {
    let application;
    try {
        application = await Application.findOneAndUpdate(
            { _id: applicationId, 'aiAnalysis.status': 'pending' },
            {
                $set: {
                    'aiAnalysis.status': 'processing',
                    'aiAnalysis.processingStartedAt': new Date()
                },
                $inc: { 'aiAnalysis.attempts': 1 }
            },
            { new: true }
        ).populate("job", "title description postedBy");
        if (!application) return;

        const filePath = resolveCvFilePath(application.cvUrl);
        const extension = path.extname(filePath);

        let buffer;
        try {
            buffer = await fs.readFile(filePath);
        } catch (error) {
            // Missing/unreadable file on disk: abort before calling the AI service.
            await markAiFailed(application, 'Resume file is missing or unreadable');
            return;
        }

        const parsed = await extractTextFromFile(buffer, extension);
        if (!parsed.success) {
            // Corrupted file, unsupported type, or a scanned image with no text
            // layer: abort before calling the AI service.
            await markAiFailed(application, parsed.reason || 'Resume text extraction failed');
            return;
        }

        const wordCount = parsed.text.split(/\s+/).filter(Boolean).length;
        if (wordCount < MIN_WORDS_FOR_SCORING) {
            // Nearly blank resume: skip the AI service call entirely.
            await markAiCompleted(application, {
                matchScore: 0,
                matchedSkills: [],
                warnings: ['Resume text is too short for reliable scoring.']
            });
            return;
        }

        const analysis = await analyzeWithAiService({
            cvText: parsed.text,
            jobTitle: application.job.title,
            jobDescription: application.job.description
        });

        if (!analysis.success) {
            await markAiFailed(application, analysis.error || 'AI service unavailable');
            return;
        }

        await markAiCompleted(application, analysis);
    } catch (error) {
        console.error("AI analysis pipeline failed:", error.message);
        if (application) {
            await markAiFailed(application, error.message).catch(() => {});
        }
    }
};


const applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applicantId = req.user.id;

      
        const { error: jobIdError } = jobIdSchema.validate({ id: jobId });
        if (jobIdError) {
            return res.status(400).json({ msg: 'Invalid Job ID format' });
        }

      
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        if (!job.isActive || job.expiresAt < Date.now()) {
            return res.status(400).json({ msg: 'This job is no longer accepting applications' });
        }

    
        const { error, value } = applyJobSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }


        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: applicantId
        });
        if (existingApplication) {
            return res.status(400).json({
                msg: 'You have already applied for this job'
            });
        }

        // The CV is always the applicant's own uploaded resume, resolved server-side
        // from their profile - never a client-supplied path/URL - so an applicant can
        // never point an application at another user's file.
        const candidateProfile = await CandidateProfile.findOne({ user: applicantId });
        if (!candidateProfile?.resumeUrl) {
            return res.status(400).json({
                msg: 'Please upload your resume in your profile before applying'
            });
        }


        const application = await Application.create({
            job: jobId,
            applicant: applicantId,
            cvUrl: candidateProfile.resumeUrl,
            notes: value.notes || ''
        });

        
        const populatedApplication = await Application.findById(application._id)
            .populate('job', 'title company location')
            .populate('applicant', 'name email');

        // Notify job poster about new application
        await createNotification({
            recipient: job.postedBy,
            type: 'new_application',
            title: 'New Application Received',
            body: `A new candidate applied for ${job.title}.`,
            relatedId: application._id,
            relatedModel: 'Application'
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: populatedApplication
        });

        // Start immediately for low latency. The database-backed worker retries
        // pending work and recovers stale processing jobs after a restart.
        processApplicationAI(application._id).catch((error) => {
            console.error('Unhandled AI analysis error:', error.message);
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// aiAnalysis is an employer-side signal used to rank a company's pipeline.
// Candidates must not see their own match score, so it is stripped from every
// applicant-facing response.
const withoutAiAnalysis = (application) => {
    const plain = typeof application.toObject === 'function' ? application.toObject() : { ...application };
    delete plain.aiAnalysis;
    return plain;
};


const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location salary')
            .sort({ appliedAt: -1 }); // الأحدث أولاً

        res.status(200).json({
            success: true,
            count: applications.length,
            applications: applications.map(withoutAiAnalysis)
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getApplicantsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        
        const { error: jobIdError } = require('./validation/jobValidation').jobIdSchema.validate({ id: jobId });
        if (jobIdError) {
            return res.status(400).json({ msg: 'Invalid Job ID format' });
        }

        
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

    
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                msg: 'Unauthorized. Only the job owner or admin can view applicants.'
            });
        }


        let applicants;

        if (req.query.sort === 'ai_score') {
            // Legacy applications have no aiAnalysis.matchScore; projecting a
            // default of -1 sorts them to the bottom without dropping them.
            applicants = await Application.aggregate([
                { $match: { job: new mongoose.Types.ObjectId(jobId) } },
                { $addFields: { aiScoreSort: { $ifNull: ['$aiAnalysis.matchScore', -1] } } },
                { $sort: { aiScoreSort: -1, appliedAt: -1 } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'applicant',
                        foreignField: '_id',
                        as: 'applicant'
                    }
                },
                { $unwind: '$applicant' },
                {
                    $project: {
                        job: 1,
                        cvUrl: 1,
                        status: 1,
                        notes: 1,
                        appliedAt: 1,
                        aiAnalysis: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        'applicant._id': 1,
                        'applicant.name': 1,
                        'applicant.email': 1,
                        'applicant.phone': 1,
                        'applicant.location': 1
                    }
                }
            ]);
        } else {
            applicants = await Application.find({ job: jobId })
                .populate('applicant', 'name email phone location') // بيانات المرشح
                .sort({ appliedAt: -1 }); // الأحدث أولاً
        }

        // Both branches return the same shape: the aggregation can't reach
        // CandidateProfile via the users lookup either, so profile fields are
        // grafted on here for whichever branch ran.
        applicants = await attachCandidateProfiles(applicants);

        res.status(200).json({
            success: true,
            count: applicants.length,
            applicants
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;

       
        const { error: idError } = applicationIdSchema.validate({ id });
        if (idError) {
            return res.status(400).json({ msg: 'Invalid Application ID format' });
        }

        
        const { error, value } = updateApplicationStatusSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }

        
        const application = await Application.findById(id)
            .populate('job', 'postedBy title');

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

     
        if ((application.job.postedBy?._id || application.job.postedBy)?.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                msg: 'Unauthorized. Only the job owner or admin can update application status.'
            });
        }

       
        application.status = value.status;
        await application.save();

        // Notify applicant about status change
        await createNotification({
            recipient: application.applicant._id || application.applicant,
            type: 'application_update',
            title: `Application ${value.status}`,
            body: `Your application for ${application.job.title} has been ${value.status}.`,
            relatedId: application._id,
            relatedModel: 'Application'
        });

        
        const updatedApplication = await Application.findById(id)
            .populate('job', 'title company location')
            .populate('applicant', 'name email phone');

        res.status(200).json({
            success: true,
            message: `Application status updated to ${value.status}`,
            application: updatedApplication
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const { error: idError } = applicationIdSchema.validate({ id });
        if (idError) {
            return res.status(400).json({ msg: 'Invalid Application ID format' });
        }

        const application = await Application.findById(id).populate('job', 'title postedBy');
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Only the applicant may withdraw - not the company, not an admin.
        if (application.applicant.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You can only withdraw your own applications' });
        }

        // Once a company has acted on it, withdrawing would rewrite their pipeline.
        if (application.status !== 'pending') {
            return res.status(400).json({
                msg: `This application has already been ${application.status} and can no longer be withdrawn`
            });
        }

        const { job } = application;
        await application.deleteOne();

        if (job?.postedBy) {
            await createNotification({
                recipient: job.postedBy,
                type: 'application_update',
                title: 'Application Withdrawn',
                body: `A candidate withdrew their application for ${job.title}.`,
                relatedId: job._id,
                relatedModel: 'Job'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const { error: idError } = applicationIdSchema.validate({ id });
        if (idError) {
            return res.status(400).json({ msg: 'Invalid Application ID format' });
        }

        
        const application = await Application.findById(id)
            .populate('job', 'title company location salary description postedBy')
            .populate('applicant', 'name email phone location skills');

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        
        const isApplicant = application.applicant._id.toString() === req.user.id;
        const isJobOwner = (application.job.postedBy?._id || application.job.postedBy)?.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isApplicant && !isJobOwner && !isAdmin) {
            return res.status(403).json({
                msg: 'Unauthorized. You can only view your own applications.'
            });
        }

        res.status(200).json({
            success: true,
            application: (isJobOwner || isAdmin) ? application : withoutAiAnalysis(application)
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const downloadApplicationCv = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job', 'postedBy');
        if (!application) return res.status(404).json({ msg: 'Application not found' });
        const isApplicant = application.applicant.toString() === req.user.id;
        const isOwner = application.job?.postedBy?.toString() === req.user.id;
        if (!isApplicant && !isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }
        const filePath = resolveCvFilePath(application.cvUrl);
        return res.download(filePath, path.basename(filePath));
    } catch {
        return res.status(404).json({ msg: 'CV file not found' });
    }
};

const reanalyzeApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job', 'postedBy');
        if (!application) return res.status(404).json({ msg: 'Application not found' });
        const isOwner = application.job?.postedBy?.toString() === req.user.id;
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Only the job owner or an admin can reanalyze this application' });
        }

        application.aiAnalysis.status = 'pending';
        application.aiAnalysis.attempts = 0;
        application.aiAnalysis.nextAttemptAt = new Date();
        application.aiAnalysis.scoringVersion = '';
        await application.save();

        res.status(202).json({
            success: true,
            message: 'Application queued for ATS reanalysis',
            applicationId: application._id
        });

        processApplicationAI(application._id).catch((error) => {
            console.error('Manual ATS reanalysis failed:', error.message);
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    updateApplicationStatus,
    withdrawApplication,
    downloadApplicationCv,
    reanalyzeApplication,
    getApplicationById,
    processApplicationAI
};
