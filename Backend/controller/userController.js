const User = require("../models/User");
const bcrypt = require('bcryptjs');
const {
    updateProfileSchema,
    changePasswordSchema,
    userIdSchema
} = require('./validation/userValidation');

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const updateMyProfile = async (req, res) => {
    try {
        //validation
        const { error } = updateProfileSchema.validate(req.body,
            {
                abortEarly: false,
                stripUnknown: true
            });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(d => d.message)
            });
        }

        const allowedUpdates = ['name', 'phone', 'location', 'profileImage'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }


        if (req.body.email || req.body.role || req.body.password) {
            return res.status(400).json({ msg: 'Cannot update email, role, or password via profile endpoint' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find({}).select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getUserProfile = async (req, res) => {
    try {
        //validation
        const { error } = userIdSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }



        const { id } = req.params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // prevent any user to see info of another user 
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
      
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



const changePassword = async (req, res) => {
    try {
        //validation
        const { error } = changePasswordSchema.validate(req.body,
            {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
            return res.status(400).json({
                msg: error.details.map(d => d.message)
            });
        }


        // if the user want to change his password he get his id from token
        //  or from params (for Admin) 

        const userId = req.params.id || req.user.id;
        const user = await User.findById(userId);

         if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { oldPassword, newPassword } = req.body;
        // Admin can change password of user without any verification

        const isAdminChanging = req.user.role === 'admin' && req.params.id;
        if (!isAdminChanging && req.user.id !== userId) {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        // if user wants to change his password he should verify old password 
        if (!isAdminChanging) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    msg: 'Old password is incorrect'
                });
            }
        }

        // Hashing new password 
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyProfile,
    getAllUsers,
    getUserProfile,
    updateMyProfile,
    deleteUser,
    changePassword
};