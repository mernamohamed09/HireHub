const path = require("path");
const fs = require("fs/promises");
const User = require("../models/User");
const Job = require("../models/jobs");
const Application = require("../models/application");
const CandidateProfile = require("../models/candidate");
const CompanyProfile = require("../models/company");
const Interview = require("../models/interview");
const Notification = require("../models/notification");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const bcrypt = require('bcryptjs');
const redis = require("../utils/redisClient");
const {
    updateProfileSchema,
    changePasswordSchema,
    userIdSchema,
    adminCreateUserSchema
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

// Admin-only account creation. This is the ONLY path that may mint an admin -
// public /api/register hard-restricts role to candidate/company.
const createUser = async (req, res) => {
    try {
        const { error, value } = adminCreateUserSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({ msg: error.details.map(d => d.message) });
        }

        const { name, email, password, role } = value;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role: role || 'candidate' });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const previousImage = user.profileImage;
        user.profileImage = `/uploads/avatars/${req.file.filename}`;
        await user.save();

        // Best-effort cleanup of the old avatar file (ignore if missing/external URL).
        if (previousImage && previousImage.startsWith('/uploads/avatars/')) {
            fs.unlink(path.join(__dirname, '..', previousImage.replace(/^\/+/, ''))).catch(() => {});
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture updated',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage
            }
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


// Deleting a User used to leave its profiles, jobs, applications, interviews,
// messages and notifications dangling. Any later .populate() on those then
// returns null and crashes the frontend. Cascade the cleanup so no document is
// left pointing at a user that no longer exists.
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user && req.user.id === id) {
            return res.status(400).json({ msg: 'You cannot delete your own account!' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // If this user is a company, their jobs and everything hanging off those
        // jobs (applications, interviews) must go too.
        if (user.role === 'company') {
            const jobs = await Job.find({ postedBy: id }).select('_id');
            const jobIds = jobs.map((job) => job._id);
            if (jobIds.length > 0) {
                await Application.deleteMany({ job: { $in: jobIds } });
                await Interview.deleteMany({ job: { $in: jobIds } });
                await Job.deleteMany({ _id: { $in: jobIds } });
            }
        }

        // As an applicant/candidate.
        await Application.deleteMany({ applicant: id });
        await CandidateProfile.deleteOne({ user: id });
        await CompanyProfile.deleteOne({ user: id });

        // Interviews where they are either party.
        await Interview.deleteMany({ $or: [{ candidate: id }, { interviewer: id }] });

        // Conversations they belong to, and those conversations' messages.
        const conversations = await Conversation.find({ participants: id }).select('_id');
        const conversationIds = conversations.map((c) => c._id);
        if (conversationIds.length > 0) {
            await Message.deleteMany({ conversation: { $in: conversationIds } });
            await Conversation.deleteMany({ _id: { $in: conversationIds } });
        }

        // Notifications addressed to them.
        await Notification.deleteMany({ recipient: id });

        await User.findByIdAndDelete(id);

        try {
            if (redis.status === 'ready') {
                await redis.del(`user:status:${id}`);
            }
        } catch {}

        res.status(200).json({
            success: true,
            message: 'User and all related data deleted successfully'
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

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCandidates = await User.countDocuments({ role: 'candidate' });
        const totalCompanies = await User.countDocuments({ role: 'company' });
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalCandidates,
                totalCompanies,
                totalJobs,
                totalApplications
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyProfile,
    createUser,
    uploadProfileImage,
    getAllUsers,
    getUserProfile,
    updateMyProfile,
    deleteUser,
    changePassword,
    getAdminStats
};