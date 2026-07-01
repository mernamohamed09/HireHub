const express = require('express');
const router = express.Router();

const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    searchJobs
} = require('../controller/jobController');

const {
    authMiddleware,
    restrictTo,
    
} = require('../middleware/authMiddleware');



router.get('/', getAllJobs);

router.get('/search', searchJobs);

router.get('/:id', authMiddleware, getJobById);



router.post('/', authMiddleware, restrictTo("admin", "company"), createJob);


router.put('/:id', authMiddleware,  restrictTo("admin", "company"), updateJob);


router.delete('/:id', authMiddleware, restrictTo("admin", "company"), deleteJob);

module.exports = router;