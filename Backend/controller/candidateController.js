const CandidateProfile = require("../models/candidate");
const User = require("../models/User");
const { updateCandidateSchema } = require("./validation/profileValidation");


const getMyCandidateProfile = async (req, res) => {
    try {
        const profile = await CandidateProfile.findOne({ user: req.user.id })
            .populate('user', '-password'); 

        if (!profile) {
            return res.status(404).json({ msg: 'Candidate profile not found' });
        }

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const updateMyCandidateProfile = async (req, res) => {
    try {
        // 1. Validation
        const { error } = updateCandidateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(d => d.message)
            });
        }

     
        let profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
          
            const newProfileData = {
                user: req.user.id,
                ...value 
            };
            profile = new CandidateProfile(newProfileData);
            await profile.save();

            return res.status(201).json({
                success: true,
                message: 'Candidate profile created successfully',
                profile
            });
        }

        const allowedUpdates = ['title', 'bio', 'skills', 'experience', 'education', 'resumeUrl', 'dateOfBirth', 'isActive'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (value[key] !== undefined) {
                updates[key] = value[key];
            }
        }

       
        if (req.body.user || req.body._id) {
            return res.status(400).json({ msg: 'Cannot update user reference or _id' });
        }

       
        Object.assign(profile, updates);
        await profile.save();

        const updatedProfile = await CandidateProfile.findById(profile._id)
            .populate('user', '-password');

        res.status(200).json({
            success: true,
            message: 'Candidate profile updated successfully',
            profile: updatedProfile
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const deleteMyCandidateProfile = async (req, res) => {
    try {
        const profile = await CandidateProfile.findOneAndDelete({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ msg: 'Candidate profile not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Candidate profile deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyCandidateProfile,
    updateMyCandidateProfile,
    deleteMyCandidateProfile
};