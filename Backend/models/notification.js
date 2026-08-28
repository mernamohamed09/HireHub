const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['application_update', 'new_application', 'interview_scheduled', 'interview_reminder', 'message', 'system', 'assessment_update'], 
        required: true 
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ['Job', 'Application', 'Interview', 'Conversation', 'CandidateInvitation'] },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
