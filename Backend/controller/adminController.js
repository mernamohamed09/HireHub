const User = require("../models/User");
const CandidateProfile = require("../models/candidate");
const CompanyProfile = require("../models/company");
const bcrypt = require('bcryptjs');
const { userIdSchema } = require('./validation/userValidation');

// get all users (supports ?role=...&search=...)
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};

        if (role) {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').lean();

     // grt all users with their profiles
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                let profile = null;
                if (user.role === 'candidate') {
                    profile = await CandidateProfile.findOne({ user: user._id }).lean();
                } else if (user.role === 'company') {
                    profile = await CompanyProfile.findOne({ user: user._id }).lean();
                }
                return { ...user, profile };
            })
        );

        res.status(200).json({
            success: true,
            count: usersWithProfiles.length,
            users: usersWithProfiles
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// get user by id (with profile)
const getUserById = async (req, res) => {
    try {
        // validate user ID
        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }

        const { id } = req.params;
        const user = await User.findById(id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
         // get profile based on role
        let profile = null;
        if (user.role === 'candidate') {
            profile = await CandidateProfile.findOne({ user: user._id }).lean();
        } else if (user.role === 'company') {
            profile = await CompanyProfile.findOne({ user: user._id }).lean();
        }

        res.status(200).json({
            success: true,
            user: { ...user, profile }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// delete user by id (with profile)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // verify user ID
        if (req.user.id === id) {
            return res.status(400).json({ msg: 'You cannot delete your own account!' });
        }

        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // delete associated profile based on role
        if (user.role === 'candidate') {
            await CandidateProfile.findOneAndDelete({ user: id });
        } else if (user.role === 'company') {
            await CompanyProfile.findOneAndDelete({ user: id });
        }

        // delete the user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: `User ${user.email} and associated profile deleted successfully`
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// insights of admin dashboard
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCandidates = await User.countDocuments({ role: 'candidate' });
        const totalCompanies = await User.countDocuments({ role: 'company' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalCandidates,
                totalCompanies,
                totalAdmins
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// change user password by admin
const changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

     
        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }

     
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

       // validate new password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });
        }

        // hash the new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Password for ${user.email} updated successfully`
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// update user role by admin
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

    
        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }


        if (!['candidate', 'company', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role. Must be candidate, company, or admin' });
        }

        // Prevent admin from changing their own role
        if (req.user.id === id && req.user.role === 'admin') {
            return res.status(400).json({ msg: 'You cannot change your own role!' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// suspend / activate user status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ msg: 'isActive must be a boolean (true or false)' });
        }

        // Prevent admin from changing their own status
        if (req.user.id === id) {
            return res.status(400).json({ msg: 'You cannot change your own account status!' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User status updated to ${isActive ? 'active' : 'suspended'}`,
            user
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    getStats,
    changeUserPassword,
    updateUserRole,
    updateUserStatus
};