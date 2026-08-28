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
    optionalAuthMiddleware,
    restrictTo,
} = require('../middleware/authMiddleware');

router.get('/', getAllJobs);

router.get('/search', searchJobs);

// Public, like GET / and /search: anyone can open a job's detail page. Inactive
// jobs stay hidden from non-owners (optionalAuthMiddleware identifies owners/admins).
router.get('/:id', optionalAuthMiddleware, getJobById);



router.post('/', authMiddleware, restrictTo("admin", "company"), createJob);


router.put('/:id', authMiddleware,  restrictTo("admin", "company"), updateJob);


router.delete('/:id', authMiddleware, restrictTo("admin", "company"), deleteJob);

module.exports = router;