const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
        required: [true, 'Job ID is required']
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Applicant ID is required']
    },
    cvUrl: {
        type: String,
        required: [true, 'CV URL is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    aiAnalysis: {
        matchScore: { type: Number, default: 0, index: true },
        matchedSkills: [{ type: String }],
        missingRequiredSkills: [{ type: String }],
        requiredSkills: [{ type: String }],
        requiredSkillGroups: [[{ type: String }]],
        skillMetadata: [{
            _id: false,
            canonical: { type: String, required: true },
            preferred: { type: String, default: '' },
            conceptId: { type: String, default: '' },
            source: { type: String, default: 'dynamic' },
            sourceVersion: { type: String, default: '' },
            license: { type: String, default: 'unclassified' },
            known: { type: Boolean, default: false }
        }],
        pendingTaxonomy: [{ type: String }],
        scoreBreakdown: {
            requiredSkills: { type: Number, default: 0 },
            preferredSkills: { type: Number, default: 0 },
            experience: { type: Number, default: 0 },
            title: { type: Number, default: 0 },
            semantic: { type: Number, default: 0 },
            semanticRaw: { type: Number, default: 0 }
        },
        requiredYears: { type: Number, default: 0 },
        candidateYears: { type: Number, default: 0 },
        scoringVersion: { type: String, default: '' },
        warnings: [{ type: String }],
        attempts: { type: Number, default: 0 },
        lastError: { type: String, default: '' },
        nextAttemptAt: { type: Date },
        processingStartedAt: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        processedAt: { type: Date }
    }
}, {
    timestamps: true
});

// prevent dublicate applicant 
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Applications = mongoose.model("Application", applicationSchema);
module.exports = Applications;
