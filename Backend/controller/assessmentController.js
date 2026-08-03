const Assessment = require('../models/assessment');
const CandidateInvitation = require('../models/candidateInvitation');
const Jobs = require('../models/jobs');
const Application = require('../models/application');
const CompanyProfile = require('../models/company');
const Notification = require('../models/notification');
const ravenAceService = require('../services/ravenAceService');

/**
 * Creates a new assessment in RavenACE and links it to the specified job.
 * Route: POST /api/jobs/:jobId/assessments
 */
exports.createAssessment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, duration, passingScore, questions } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets req.user.id

    // 1. Fetch the Job and verify ownership (IDOR protection)
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage this job' });
    }

    // 2. Get the CompanyProfile to fetch the official company name
    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res.status(404).json({ message: 'Company profile not found for this user' });
    }

    // 3. Prepare payload and call RavenACE
    const examData = {
      title,
      duration,
      passingScore,
      questions,
      companyName: companyProfile.companyName
    };

    const ravenAceExamId = await ravenAceService.createExam(examData, userId);

    // 4. Save to our local Assessment model
    const newAssessment = new Assessment({
      job: jobId,
      title,
      ravenAceExamId
    });
    
    await newAssessment.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: newAssessment
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to create assessment, please try again.' });
  }
};

/**
 * Gets all assessments configured for a specific job.
 * Route: GET /api/jobs/:jobId/assessments
 */
exports.getJobAssessments = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // 1. Verify job ownership (IDOR protection)
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view assessments for this job' });
    }

    // 2. Fetch assessments
    const assessments = await Assessment.find({ job: jobId }).sort({ createdAt: -1 });

    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error fetching job assessments:', error);
    res.status(500).json({ message: 'Server error while fetching assessments' });
  }
};

/**
 * Invites an applicant to take a specific assessment.
 * Route: POST /api/applications/:applicationId/assessments/:assessmentId/invite
 */
exports.inviteApplicant = async (req, res) => {
  try {
    const { applicationId, assessmentId } = req.params;
    const userId = req.user.id;

    // 1. Verify ownership of the application (via Job)
    const application = await Application.findById(applicationId).populate('applicant', 'email').populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage this application' });
    }

    // 2. Verify assessment exists and belongs to the same job
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.job.toString() !== application.job._id.toString()) {
      return res.status(400).json({ message: 'Bad Request: Assessment does not belong to this job' });
    }

    // 3. Call RavenACE to invite
    const inviteData = await ravenAceService.inviteCandidate(
      assessment.ravenAceExamId,
      application.applicant.email,
      userId
    );

    // 4. Save Invitation locally
    const invitation = new CandidateInvitation({
      application: applicationId,
      assessment: assessmentId,
      ravenAceInvitationId: inviteData.invitationId
    });

    await invitation.save();

    // 5. Send Notification to candidate
    try {
      await Notification.create({
        recipient: application.applicant._id,
        type: 'assessment_update',
        title: 'New Assessment Invitation',
        body: `You have been invited to take the assessment: ${assessment.title} for the role of ${application.job.title}. Please check your email.`,
        relatedId: invitation._id,
        relatedModel: 'CandidateInvitation'
      });
    } catch (notifError) {
      console.error('Failed to send invite notification:', notifError);
      // We don't throw here to ensure the invitation response still succeeds
    }

    res.status(200).json({
      message: 'Applicant invited successfully',
      invitation
    });

  } catch (error) {
    // Handle uniqueness error if invited twice
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Candidate has already been invited to this assessment' });
    }
    console.error('Error inviting applicant:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to invite applicant, please try again.' });
  }
};

/**
 * Gets all invitations sent to a specific application.
 * Route: GET /api/applications/:applicationId/invitations
 */
exports.getApplicationInvitations = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    // 1. Verify application ownership via job (IDOR protection)
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view invitations for this application' });
    }

    // 2. Fetch invitations with populated assessment details
    const invitations = await CandidateInvitation.find({ application: applicationId })
      .populate('assessment', 'title createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Error fetching application invitations:', error);
    res.status(500).json({ message: 'Server error while fetching application invitations' });
  }
};

/**
 * Gets the real-time result of an assessment for a candidate.
 * Route: GET /api/invitations/:candidateInvitationId/result
 */
exports.getApplicantResult = async (req, res) => {
  try {
    const { candidateInvitationId } = req.params;
    const userId = req.user.id;

    // 1. Fetch CandidateInvitation and fully populate the chain up to Job
    const invitation = await CandidateInvitation.findById(candidateInvitationId)
      .populate({
        path: 'application',
        populate: {
          path: 'job',
          select: 'postedBy'
        }
      });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // 2. IDOR Protection: Ensure the logged-in user is the one who posted the job
    const jobPostedBy = invitation.application?.job?.postedBy;
    if (!jobPostedBy || jobPostedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view this result' });
    }

    // 3. Fetch result from RavenACE
    const result = await ravenAceService.getExamResult(invitation.ravenAceInvitationId);

    res.status(200).json({ result });

  } catch (error) {
    console.error('Error fetching applicant result:', error);
    res.status(500).json({ message: 'Failed to fetch applicant result, please try again.' });
  }
};

/**
 * Gets detailed results for all assessments of an application.
 * Route: GET /api/applications/:applicationId/results
 */
exports.getApplicationDetailedResults = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    // 1. Verify application ownership via job (IDOR protection)
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // IDOR protection: only the recruiter who posted the job can view these details
    if (application.job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to view this application's results" });
    }

    // 2. Fetch all invitations with populated assessment details
    const invitations = await CandidateInvitation.find({ application: applicationId })
      .populate('assessment', 'title');

    if (!invitations || invitations.length === 0) {
      return res.status(200).json({ message: 'No assessments found for this application', results: [] });
    }

    // 3. For each invitation, build the response
    const results = await Promise.all(invitations.map(async (inv) => {
      let detailedResult = null;
      
      if (inv.status === 'completed') {
        try {
          detailedResult = await ravenAceService.getDetailedResult(inv.ravenAceInvitationId);
        } catch (error) {
          console.error(`Failed to fetch detailed result for invitation ${inv._id}:`, error.message);
          // We don't fail the entire request, just leave detailedResult as null
        }
      }

      return {
        invitationId: inv._id,
        assessmentTitle: inv.assessment?.title || 'Unknown Assessment',
        status: inv.status,
        score: inv.score,
        passed: inv.passed,
        detailedResult
      };
    }));

    res.status(200).json({
      message: 'Results fetched successfully',
      results
    });

  } catch (error) {
    console.error('Error fetching application detailed results:', error);
    res.status(500).json({ message: 'Server error while fetching detailed results' });
  }
};

/**
 * Gets all completed assessments for jobs posted by the logged-in company.
 * Route: GET /api/assessments/company/results
 */
exports.getCompanyCompletedAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. Find all jobs posted by this company
    const jobs = await Jobs.find({ postedBy: userId }).select('_id');
    const jobIds = jobs.map(j => j._id);
    
    // 2. Find all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } }).select('_id');
    const applicationIds = applications.map(a => a._id);
    
    // 3. Find completed invitations for these applications
    const invitations = await CandidateInvitation.find({
      application: { $in: applicationIds },
      status: 'completed'
    })
    .populate('assessment', 'title duration passingScore')
    .populate({
      path: 'application',
      populate: [
        { path: 'applicant', select: 'firstName lastName email' },
        { path: 'job', select: 'title' }
      ]
    })
    .sort({ completedAt: -1 });

    res.status(200).json({ results: invitations });
  } catch (error) {
    console.error('Error fetching company completed assessments:', error);
    res.status(500).json({ message: 'Error fetching completed assessments', error: error.message });
  }
};

/**
 * Gets all completed assessments for the logged-in candidate.
 * Route: GET /api/assessments/candidate/results
 */
exports.getCandidateCompletedAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Find all applications for this candidate
    const applications = await Application.find({ applicant: userId }).select('_id');
    const applicationIds = applications.map(a => a._id);
    
    // 2. Find all invitations for these applications
    const invitations = await CandidateInvitation.find({
      application: { $in: applicationIds }
    })
    .populate('assessment', 'title duration passingScore')
    .populate({
      path: 'application',
      populate: {
        path: 'job',
        select: 'title company',
      }
    })
    .sort({ completedAt: -1 });

    res.status(200).json({ results: invitations });
  } catch (error) {
    console.error('Error fetching candidate completed assessments:', error);
    res.status(500).json({ message: 'Error fetching completed assessments', error: error.message });
  }
};

/**
 * Generate (or retrieve) a start link for a candidate's invitation
 * Route: POST /api/candidate/invitations/:invitationId/start-link
 */
exports.generateCandidateInviteLink = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await CandidateInvitation.findById(invitationId).populate('application');
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // IDOR Check: Ensure the applicant requesting the link is the one who owns the application
    if (invitation.application.applicant.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this invitation' });
    }

    // Call RavenACE to generate the link
    const linkData = await ravenAceService.generateInviteLink(invitation.ravenAceInvitationId);
    
    res.status(200).json(linkData);
  } catch (error) {
    console.error('Error generating invite link:', error);
    res.status(error.statusCode || 500).json({ 
      message: 'Error generating invite link', 
      error: error.message 
    });
  }
};
