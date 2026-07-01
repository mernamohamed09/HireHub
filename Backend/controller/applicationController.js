const Application = require("../models/application");
const Job = require("../models/jobs");


const {
    applyJobSchema,
    updateApplicationStatusSchema,
    applicationIdSchema
} = require("./validation/applicationValidation");
const {jobIdSchema}= require ("./validation/jobValidation");


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

     
        const application = await Application.create({
            job: jobId,
            applicant: applicantId,
            cvUrl: value.cvUrl,
            notes: value.notes || ''
        });

        
        const populatedApplication = await Application.findById(application._id)
            .populate('job', 'title company location')
            .populate('applicant', 'name email');

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: populatedApplication
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location salary')
            .sort({ appliedAt: -1 }); // الأحدث أولاً

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
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

      
        const applicants = await Application.find({ job: jobId })
            .populate('applicant', 'name email phone location skills') // بيانات المرشح
            .sort({ appliedAt: -1 }); // الأحدث أولاً

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

     
        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                msg: 'Unauthorized. Only the job owner or admin can update application status.'
            });
        }

       
        application.status = value.status;
        await application.save();

        
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


const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const { error: idError } = applicationIdSchema.validate({ id });
        if (idError) {
            return res.status(400).json({ msg: 'Invalid Application ID format' });
        }

        
        const application = await Application.findById(id)
            .populate('job', 'title company location salary description')
            .populate('applicant', 'name email phone location skills');

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        
        const isApplicant = application.applicant._id.toString() === req.user.id;
        const isJobOwner = application.job.postedBy?.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isApplicant && !isJobOwner && !isAdmin) {
            return res.status(403).json({
                msg: 'Unauthorized. You can only view your own applications.'
            });
        }

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    updateApplicationStatus,
    getApplicationById
};