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


router.use(authMiddleware,restrictTo('candidate'));

router.route('/me')
    .get(getMyCandidateProfile)
    .put(updateMyCandidateProfile)
    .delete(deleteMyCandidateProfile);

router.route('/me/cv')
    .get(downloadCandidateResume)
    .post(uploadCV, uploadCandidateResume)
    .delete(deleteCandidateResume);

router.post('/me/autofill', autofillFromResume);
router.put('/me/portfolio', updatePortfolio);

module.exports = router;
