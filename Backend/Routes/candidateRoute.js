const express = require('express');
const router = express.Router();
const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const uploadCV = require('../middleware/uploadMulter');
const {
    getMyCandidateProfile,
    updateMyCandidateProfile,
    updatePortfolio,
    uploadCandidateResume,
    downloadCandidateResume,
    deleteCandidateResume,
    autofillFromResume,
    deleteMyCandidateProfile
} = require('../controller/candidateController');


const { createLimiter } = require('../utils/rateLimiter');

const uploadLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    prefix: 'upload',
    keyGenerator: (req) => req.user?.id || 'candidate',
    message: 'Upload rate limit reached. Please wait before uploading another file.'
});

const autofillLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    prefix: 'autofill',
    keyGenerator: (req) => req.user?.id || 'candidate',
    message: 'Autofill rate limit reached. Please try again later.'
});

router.use(authMiddleware,restrictTo('candidate'));

router.route('/me')
    .get(getMyCandidateProfile)
    .put(updateMyCandidateProfile)
    .delete(deleteMyCandidateProfile);

router.route('/me/cv')
    .get(downloadCandidateResume)
    .post(uploadLimiter, uploadCV, uploadCandidateResume)
    .delete(deleteCandidateResume);

router.post('/me/autofill', autofillLimiter, autofillFromResume);
router.put('/me/portfolio', updatePortfolio);

module.exports = router;
