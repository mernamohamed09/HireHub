const CompanyProfile = require("../models/company");
const User = require("../models/User");
const { updateCompanySchema } = require("./validation/profileValidation");

const getMyCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ user: req.user.id })
            .populate('user', '-password');

        if (!profile) {
            return res.status(404).json({ msg: 'Company profile not found' });
        }

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateMyCompanyProfile = async (req, res) => {
    try {
        const { error } = updateCompanySchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(d => d.message)
            });
        }

        let profile = await CompanyProfile.findOne({ user: req.user.id });

        if (!profile) {
        
            const newProfileData = {
                user: req.user.id,
                ...req.body
            };
            profile = new CompanyProfile(newProfileData);
            await profile.save();

            return res.status(201).json({
                success: true,
                message: 'Company profile created successfully',
                profile
            });
        }

        const allowedUpdates = ['companyName', 'industry', 'description', 'website', 'companySize', 'logoUrl', 'foundedYear', 'isVerified'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (req.body.user || req.body._id) {
            return res.status(400).json({ msg: 'Cannot update user reference or _id' });
        }

        Object.assign(profile, updates);
        await profile.save();

        const updatedProfile = await CompanyProfile.findById(profile._id)
            .populate('user', '-password');

        res.status(200).json({
            success: true,
            message: 'Company profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const deleteMyCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOneAndDelete({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ msg: 'Company profile not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Company profile deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyCompanyProfile,
    updateMyCompanyProfile,
    deleteMyCompanyProfile
};