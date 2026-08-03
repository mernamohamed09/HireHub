const express = require('express');
const router = express.Router();
const assessmentController = require('../controller/assessmentController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Assumes an auth middleware exists

// Create a new assessment for a job
// Route: POST /api/jobs/:jobId/assessments
router.post('/jobs/:jobId/assessments', authMiddleware, assessmentController.createAssessment);

// Get all assessments configured for a specific job
// Route: GET /api/jobs/:jobId/assessments
router.get('/jobs/:jobId/assessments', authMiddleware, assessmentController.getJobAssessments);

// Invite an applicant to an assessment
// Route: POST /api/applications/:applicationId/assessments/:assessmentId/invite
router.post('/applications/:applicationId/assessments/:assessmentId/invite', authMiddleware, assessmentController.inviteApplicant);

// Get all invitations sent to a specific application
// Route: GET /api/applications/:applicationId/invitations
router.get('/applications/:applicationId/invitations', authMiddleware, assessmentController.getApplicationInvitations);

// Get the result of an assessment for an applicant
// Route: GET /api/invitations/:candidateInvitationId/result
router.get('/invitations/:candidateInvitationId/result', authMiddleware, assessmentController.getApplicantResult);

// Get detailed results for all assessments of an application
// Route: GET /api/applications/:applicationId/results
router.get('/applications/:applicationId/results', authMiddleware, assessmentController.getApplicationDetailedResults);

// Get all completed assessments for a company
// Route: GET /api/assessments/company/results
router.get('/company/results', authMiddleware, assessmentController.getCompanyCompletedAssessments);

// Get all completed assessments for a candidate
// Route: GET /api/assessments/candidate/results
router.get('/candidate/results', authMiddleware, assessmentController.getCandidateCompletedAssessments);

// Generate start link for a candidate's invitation
// Route: POST /api/candidate/invitations/:invitationId/start-link
router.post('/candidate/invitations/:invitationId/start-link', authMiddleware, assessmentController.generateCandidateInviteLink);

module.exports = router;
