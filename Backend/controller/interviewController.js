const Interview = require('../models/interview');
const Job = require('../models/jobs');
const User = require('../models/User');
const Application = require('../models/application');
const { createNotification } = require('./notificationController');
const { createInterviewSchema, updateInterviewSchema } = require('./validation/interviewValidation');

const createInterview = async (req, res) => {
    try {
        const { error, value } = createInterviewSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({ msg: error.details.map((d) => d.message) });
        }

        const { jobId, applicationId, candidateId, date, startTime, endTime, type, meetingLink, notes } = value;

        if (endTime <= startTime) {
            return res.status(400).json({ msg: 'endTime must be after startTime' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Verify interviewer is the job poster or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized to schedule interview for this job' });
        }

        // The candidate must actually have applied to this job - no scheduling
        // interviews with people who never applied.
        const application = await Application.findOne({ job: jobId, applicant: candidateId });
        if (!application) {
            return res.status(400).json({ msg: 'This candidate has not applied to this job' });
        }

        // Reject double-booking the same interviewer at the same date + start time.
        const clash = await Interview.findOne({
            interviewer: req.user.id,
            date,
            startTime,
            status: { $ne: 'cancelled' }
        });
        if (clash) {
            return res.status(409).json({ msg: 'You already have an interview scheduled at that date and time' });
        }

        const interview = await Interview.create({
            job: jobId,
            application: applicationId || application._id,
            interviewer: req.user.id,
            candidate: candidateId,
            date,
            startTime,
            endTime,
            type: type || 'video',
            meetingLink: meetingLink || '',
            notes: notes || ''
        });

        // Notify candidate
        const candidateUser = await User.findById(candidateId);
        if (candidateUser) {
            await createNotification({
                recipient: candidateId,
                type: 'interview_scheduled',
                title: 'Interview Scheduled',
                body: `You have an interview scheduled for ${job.title} on ${new Date(date).toLocaleDateString()} at ${startTime}.`,
                relatedId: interview._id,
                relatedModel: 'Interview'
            });
        }

        res.status(201).json({
            success: true,
            interview
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            $or: [
                { interviewer: req.user.id },
                { candidate: req.user.id }
            ]
        })
        .populate('job', 'title company location salary')
        .populate('interviewer', 'name email phone location')
        .populate('candidate', 'name email phone location')
        .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;

        const { error, value } = updateInterviewSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({ msg: error.details.map((d) => d.message) });
        }

        const interview = await Interview.findById(id);

        if (!interview) {
            return res.status(404).json({ msg: 'Interview not found' });
        }

        if (interview.interviewer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const allowedUpdates = ['date', 'startTime', 'endTime', 'type', 'meetingLink', 'notes', 'status'];
        for (const key of allowedUpdates) {
            if (value[key] !== undefined) {
                interview[key] = value[key];
            }
        }

        // Guard the time order when either bound changes.
        if (interview.endTime <= interview.startTime) {
            return res.status(400).json({ msg: 'endTime must be after startTime' });
        }

        await interview.save();

        const updatedInterview = await Interview.findById(id)
            .populate('job', 'title company')
            .populate('interviewer', 'name email')
            .populate('candidate', 'name email');

        // Notify candidate if updated or status changed
        await createNotification({
            recipient: interview.candidate,
            type: 'interview_scheduled',
            title: 'Interview Details Updated',
            body: `Your interview details have been updated. Status: ${interview.status}.`,
            relatedId: interview._id,
            relatedModel: 'Interview'
        });

        res.status(200).json({
            success: true,
            interview: updatedInterview
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const cancelInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);

        if (!interview) {
            return res.status(404).json({ msg: 'Interview not found' });
        }

        // Only candidate, interviewer, or admin can cancel
        const isCandidate = interview.candidate.toString() === req.user.id;
        const isInterviewer = interview.interviewer.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isCandidate && !isInterviewer && !isAdmin) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        interview.status = 'cancelled';
        await interview.save();

        const otherUser = isCandidate ? interview.interviewer : interview.candidate;
        await createNotification({
            recipient: otherUser,
            type: 'interview_scheduled',
            title: 'Interview Cancelled',
            body: `The interview has been cancelled by the other participant.`,
            relatedId: interview._id,
            relatedModel: 'Interview'
        });

        res.status(200).json({
            success: true,
            message: 'Interview cancelled successfully',
            interview
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getInterviewsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const interviews = await Interview.find({ job: jobId })
            .populate('candidate', 'name email phone')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            interviews
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createInterview,
    getMyInterviews,
    updateInterview,
    cancelInterview,
    getInterviewsByJob
};
