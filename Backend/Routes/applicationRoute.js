const express = require('express');
const router = express.Router();

const {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    updateApplicationStatus,
    withdrawApplication,
    downloadApplicationCv,
    reanalyzeApplication,
    getApplicationById
} = require("../controller/applicationController")

const {
    authMiddleware,
    restrictTo
} = require("../middleware/authMiddleware");


router.post('/apply/:jobId', authMiddleware, restrictTo("candidate"), applyToJob);

router.get('/my-applications', authMiddleware, restrictTo("candidate"), getMyApplications);

router.get('/job/:jobId/applicants', authMiddleware,  restrictTo("admin", "company"), getApplicantsForJob);

router.put('/:id/status', authMiddleware,  restrictTo("admin", "company"), updateApplicationStatus);

router.delete('/:id', authMiddleware, restrictTo("candidate"), withdrawApplication);

router.get('/:id/cv', authMiddleware, downloadApplicationCv);
router.post('/:id/reanalyze', authMiddleware, restrictTo("admin", "company"), reanalyzeApplication);

router.get('/:id', authMiddleware, getApplicationById);

module.exports = router;
