const express = require('express');
const router = express.Router();
const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const {
    getMyCandidateProfile,
    updateMyCandidateProfile,
    deleteMyCandidateProfile
} = require('../controller/candidateController');


router.use(authMiddleware,restrictTo('candidate'));

router.route('/me')
    .get(getMyCandidateProfile)
    .put(updateMyCandidateProfile)
    .delete(deleteMyCandidateProfile);

module.exports = router;