const express = require('express');
const router = express.Router();
const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const {
    getMyCompanyProfile,
    updateMyCompanyProfile,
    deleteMyCompanyProfile
} = require('../controller/companyController');


router.use(authMiddleware, restrictTo('company'));

router.route('/me')
    .get(getMyCompanyProfile)
    .put(updateMyCompanyProfile)
    .delete(deleteMyCompanyProfile);

module.exports = router;