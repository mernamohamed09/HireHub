const express = require('express');
const router = express.Router();
const {
    createUser,
    uploadProfileImage,
    getAllUsers,
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    deleteUser,
    changePassword,
    getAdminStats
} = require('../controller/userController');

const {restrictTo, authMiddleware } = require('../middleware/authMiddleware');
const uploadAvatar = require('../middleware/uploadAvatar');

// Routes for current user
router.route('/profile')
    .get(authMiddleware, getMyProfile)
    .put( authMiddleware,updateMyProfile);

// Profile picture upload (any authenticated user)
router.post('/profile/avatar', authMiddleware, uploadAvatar, uploadProfileImage);

// Routes for Admin
router.route('/')
    .get( authMiddleware, restrictTo("admin"), getAllUsers)
    .post( authMiddleware, restrictTo("admin"), createUser);

// Admin stats - MUST be before /:id to prevent 'stats' being treated as an ID
router.get('/stats', authMiddleware, restrictTo('admin'), getAdminStats);

router.route('/:id')
    .get( authMiddleware, restrictTo("admin"), getUserProfile)
    .delete( authMiddleware, restrictTo("admin"), deleteUser);

//change password
router.put('/change-password', authMiddleware, changePassword);
router.put('/change-password/:id', authMiddleware, changePassword);

module.exports = router;