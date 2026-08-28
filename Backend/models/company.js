const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: true, 
        },
        industry: {
            type: String,
            default: '', 
        }, 
        description: {
            type: String,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        companySize: {
            type: String,
            default: '',
        },
        logoUrl: {
            type: String,
            default: '',
        },
        foundedYear: {
            type: Number,
        },
        isVerified: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);
module.exports = CompanyProfile;