const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    deleteUser,
    changePassword
} = require('../controller/userController');

const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');

// Routes for current user
router.route('/profile')
    .get(authMiddleware, getMyProfile)
    .put( authMiddleware,updateMyProfile);

// Routes for Admin 
router.route('/')
    .get( authMiddleware, restrictTo("admin"), getAllUsers);

router.route('/:id')
    .get( authMiddleware, restrictTo("admin"), getUserProfile)
    .delete( authMiddleware, restrictTo("admin"), deleteUser);

//change password
router.put('/change-password', authMiddleware, changePassword);
router.put('/change-password/:id', authMiddleware, changePassword);

module.exports = router;