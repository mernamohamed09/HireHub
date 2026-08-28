const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    getStats,
    changeUserPassword,
    updateUserRole,
    updateUserStatus
} = require('../controller/adminController');
const { deleteUser } = require('../controller/userController');
const { authMiddleware, restrictTo} = require('../middleware/authMiddleware');


router.use(authMiddleware);
router.use(restrictTo('admin'));

// insights and stats
router.get('/stats', getStats);


router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .delete(deleteUser);


router.put('/users/:id/password', changeUserPassword);


router.put('/users/:id/role', updateUserRole);


router.patch('/users/:id/status', updateUserStatus);

module.exports = router;