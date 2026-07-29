const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        title: {
            type: String,
            default: '', 
        },
        bio: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        experience: [
            {
                company: { type: String },
                position: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
                description: { type: String },
            }
        ],
        education: [
            {
                institution: { type: String },
                degree: { type: String },
                fieldOfStudy: { type: String },
                graduationYear: { type: Number },
            }
        ],
        socialLinks: {
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            portfolio: { type: String, default: '' },
            website: { type: String, default: '' }
        },
        resumeUrl: {
            type: String,
            default: '', 
        },
        dateOfBirth: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);
module.exports = CandidateProfile;
