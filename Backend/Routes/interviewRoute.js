const express = require('express');
const router = express.Router();
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const {
    createInterview,
    getMyInterviews,
    updateInterview,
    cancelInterview,
    getInterviewsByJob
} = require('../controller/interviewController');

router.use(authMiddleware);

router.post('/', restrictTo('company', 'admin'), createInterview);
router.get('/my', getMyInterviews);
router.get('/job/:jobId', restrictTo('company', 'admin'), getInterviewsByJob);
router.put('/:id', restrictTo('company', 'admin'), updateInterview);
router.put('/:id/cancel', cancelInterview);

module.exports = router;
