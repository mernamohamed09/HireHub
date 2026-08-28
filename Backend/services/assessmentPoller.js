const CandidateInvitation = require('../models/candidateInvitation');
const Notification = require('../models/notification');
const ravenAceService = require('./ravenAceService');

const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
let timer;
let running = false;

const runPoller = async () => {
    if (running) return;
    running = true;

    try {
        // Find invitations that are not in a final state
        const pendingInvitations = await CandidateInvitation.find({
            status: { $nin: ['completed', 'error'] }
        }).populate({
            path: 'application',
            populate: [
                { path: 'job', select: 'postedBy title' },
                { path: 'applicant', select: 'name' }
            ]
        });

        if (pendingInvitations.length === 0) {
            return;
        }

        for (const invitation of pendingInvitations) {
            try {
                const externalCompanyId = invitation.application.job.postedBy.toString();
                
                const result = await ravenAceService.getExamResult(
                    invitation.ravenAceInvitationId
                );

                const oldStatus = invitation.status;
                const newStatus = result.status;

                if (oldStatus !== 'completed' && newStatus === 'completed') {
                    // Update state locally
                    invitation.status = newStatus;
                    invitation.score = result.score;
                    invitation.passed = result.passed;
                    await invitation.save();

                    const candidateName = invitation.application.applicant.name || 'Candidate';
                    const jobTitle = invitation.application.job.title;

                    // 1. Notify recruiter about completion
                    await Notification.create({
                        recipient: invitation.application.job.postedBy,
                        type: 'assessment_update',
                        title: 'Assessment Completed',
                        body: `${candidateName} has completed the assessment for ${jobTitle}.`,
                        relatedId: invitation._id,
                        relatedModel: 'CandidateInvitation'
                    });

                    // 2. Notify recruiter if candidate passed
                    if (result.passed) {
                        await Notification.create({
                            recipient: invitation.application.job.postedBy,
                            type: 'assessment_update',
                            title: 'Candidate Passed!',
                            body: `${candidateName} has passed the assessment for ${jobTitle} with a score of ${result.score}%.`,
                            relatedId: invitation._id,
                            relatedModel: 'CandidateInvitation'
                        });
                    }
                } else if (oldStatus !== newStatus) {
                    // Just update the local status if it progressed
                    invitation.status = newStatus;
                    await invitation.save();
                }
            } catch (err) {
                console.error(`Error polling for invitation ${invitation._id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Assessment poller batch failed:', error.message);
    } finally {
        running = false;
    }
};

const startAssessmentPoller = () => {
    if (timer) return;
    void runPoller();
    timer = setInterval(runPoller, POLL_INTERVAL_MS);
    timer.unref?.();
};

module.exports = { startAssessmentPoller, runPoller };
