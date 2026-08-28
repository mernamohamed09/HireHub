const fs = require("fs/promises");
const path = require("path");

const CandidateProfile = require("../models/candidate");
const User = require("../models/User");
const Application = require("../models/application");
const { updateCandidateSchema } = require("./validation/profileValidation");
const { updateProfileSchema } = require("./validation/userValidation");
const { extractTextFromFile } = require("../services/fileParser");
const { parseResumeText } = require("../services/resumeParser");

const resolveCvFilePath = (cvUrl) => {
    const { pathname } = new URL(cvUrl, "http://internal");
    const cvRoot = path.resolve(__dirname, "..", "uploads", "cvs");
    const resolved = path.resolve(__dirname, "..", pathname.replace(/^\/+/, ""));
    if (resolved !== cvRoot && !resolved.startsWith(`${cvRoot}${path.sep}`)) {
        throw new Error("Invalid CV path");
    }
    return resolved;
};

/**
 * Removes a CV file from disk once nothing points at it any more.
 *
 * Applications snapshot the cvUrl they were submitted with, so a resume that is
 * still attached to an application must survive replacement - deleting it would
 * break "View CV" on the company's ATS board for that past application.
 */
const deleteCvFileIfUnreferenced = async (cvUrl) => {
    if (!cvUrl) return;

    const referencingApplications = await Application.countDocuments({ cvUrl });
    if (referencingApplications > 0) return;

    try {
        await fs.unlink(resolveCvFilePath(cvUrl));
    } catch (error) {
        // Already gone (ENOENT) is the expected no-op; anything else is worth a log
        // but must not fail the user's upload.
        if (error.code !== 'ENOENT') {
            console.error('Failed to delete old CV file:', error.message);
        }
    }
};


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
        // 1. Validation (value, error)
        const { error, value } = updateCandidateSchema.validate(req.body, {
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

        const allowedUpdates = ['title', 'bio', 'skills', 'experience', 'education', 'socialLinks', 'dateOfBirth', 'isActive'];
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

const uploadCandidateResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const resumeUrl = `/uploads/cvs/${req.file.filename}`;

        let profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
            profile = new CandidateProfile({ user: req.user.id, resumeUrl });
            await profile.save();
            return res.status(201).json({
                success: true,
                message: 'Resume uploaded successfully',
                profile
            });
        }

        const previousResumeUrl = profile.resumeUrl;

        profile.resumeUrl = resumeUrl;
        await profile.save();

        if (previousResumeUrl && previousResumeUrl !== resumeUrl) {
            await deleteCvFileIfUnreferenced(previousResumeUrl);
        }

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const deleteCandidateResume = async (req, res) => {
    try {
        const profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ msg: 'Candidate profile not found' });
        }
        if (!profile.resumeUrl) {
            return res.status(400).json({ msg: 'No CV to delete' });
        }

        const removedResumeUrl = profile.resumeUrl;
        profile.resumeUrl = '';
        await profile.save();

        await deleteCvFileIfUnreferenced(removedResumeUrl);

        res.status(200).json({
            success: true,
            message: 'CV deleted successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const downloadCandidateResume = async (req, res) => {
    try {
        const profile = await CandidateProfile.findOne({ user: req.user.id });
        if (!profile?.resumeUrl) return res.status(404).json({ msg: 'No CV uploaded' });
        const filePath = resolveCvFilePath(profile.resumeUrl);
        return res.download(filePath, path.basename(filePath));
    } catch {
        return res.status(404).json({ msg: 'CV file not found' });
    }
};

const updatePortfolio = async (req, res) => {
    try {
        const candidateInput = req.body.profile || {};
        const userInput = req.body.contact || {};
        const candidateValidation = updateCandidateSchema.validate(candidateInput, {
            abortEarly: false,
            stripUnknown: true
        });
        const userValidation = updateProfileSchema.validate(userInput, {
            abortEarly: false,
            stripUnknown: true
        });
        const validationErrors = [
            ...(candidateValidation.error?.details || []),
            ...(userValidation.error?.details || [])
        ];
        if (validationErrors.length) {
            return res.status(400).json({ msg: validationErrors.map((item) => item.message) });
        }

        const [profile, user] = await Promise.all([
            CandidateProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: candidateValidation.value, $setOnInsert: { user: req.user.id } },
                { new: true, upsert: true, runValidators: true }
            ).populate('user', '-password'),
            User.findByIdAndUpdate(
                req.user.id,
                userValidation.value,
                { new: true, runValidators: true }
            ).select('-password')
        ]);

        return res.status(200).json({
            success: true,
            message: 'Portfolio updated successfully',
            profile,
            user
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

// Reads the candidate's uploaded CV and returns SUGGESTED profile fields for the
// UI to prefill an editable form. It never saves - the candidate reviews first.
const autofillFromResume = async (req, res) => {
    try {
        const profile = await CandidateProfile.findOne({ user: req.user.id });
        if (!profile?.resumeUrl) {
            return res.status(400).json({ msg: 'Upload a CV first, then autofill from it.' });
        }

        const filePath = resolveCvFilePath(profile.resumeUrl);
        const extension = path.extname(filePath);

        let buffer;
        try {
            buffer = await fs.readFile(filePath);
        } catch {
            return res.status(400).json({ msg: 'Your CV file could not be read. Try re-uploading it.' });
        }

        const parsed = await extractTextFromFile(buffer, extension);
        if (!parsed.success) {
            return res.status(400).json({ msg: 'Could not read text from your CV (it may be a scanned image).' });
        }

        const suggestions = parseResumeText(parsed.text);

        res.status(200).json({
            success: true,
            suggestions
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
    updatePortfolio,
    uploadCandidateResume,
    downloadCandidateResume,
    deleteCandidateResume,
    autofillFromResume,
    deleteMyCandidateProfile
};
