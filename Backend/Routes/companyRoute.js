const express = require('express');
const router = express.Router();
const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const {
    getMyCompanyProfile,
    updateMyCompanyProfile,
    deleteMyCompanyProfile,
    setCompanyVerification
} = require('../controller/companyController');

// Admin-only verification toggle. Declared before the company-only router.use
// below so it keeps its own admin guard rather than inheriting restrictTo('company').
router.put('/:id/verify', authMiddleware, restrictTo('admin'), setCompanyVerification);

router.use(authMiddleware, restrictTo('company'));

router.route('/me')
    .get(getMyCompanyProfile)
    .put(updateMyCompanyProfile)
    .delete(deleteMyCompanyProfile);

module.exports = router;