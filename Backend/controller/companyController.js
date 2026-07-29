const CompanyProfile = require("../models/company");
const User = require("../models/User");
const { updateCompanySchema } = require("./validation/profileValidation");

const COMPANY_EDITABLE_FIELDS = ['companyName', 'industry', 'description', 'website', 'companySize', 'logoUrl', 'foundedYear'];

const pickEditable = (source) => {
    const picked = {};
    for (const key of COMPANY_EDITABLE_FIELDS) {
        if (source[key] !== undefined) picked[key] = source[key];
    }
    return picked;
};

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

        if (req.body.user || req.body._id) {
            return res.status(400).json({ msg: 'Cannot update user reference or _id' });
        }

        if (!profile) {
            // Only whitelisted fields on creation too - never trust ...req.body,
            // or a company could set isVerified on its very first save.
            profile = new CompanyProfile({
                user: req.user.id,
                ...pickEditable(req.body)
            });
            await profile.save();

            return res.status(201).json({
                success: true,
                message: 'Company profile created successfully',
                profile
            });
        }

        Object.assign(profile, pickEditable(req.body));
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

// Admin-only. The verified badge is a trust signal, so only an admin may set it.
const setCompanyVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ msg: 'isVerified must be a boolean' });
        }

        const profile = await CompanyProfile.findByIdAndUpdate(
            id,
            { isVerified },
            { new: true }
        ).populate('user', '-password');

        if (!profile) {
            return res.status(404).json({ msg: 'Company profile not found' });
        }

        res.status(200).json({
            success: true,
            message: `Company ${isVerified ? 'verified' : 'unverified'} successfully`,
            profile
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyCompanyProfile,
    updateMyCompanyProfile,
    deleteMyCompanyProfile,
    setCompanyVerification
};