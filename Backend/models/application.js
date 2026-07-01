const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
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
    }
}, {
    timestamps: true 
});

// prevent dublicate applicant 
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Applications = mongoose.model("Application", applicationSchema);
module.exports = Applications;