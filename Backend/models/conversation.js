const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    participantKey: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    lastMessage: {
        text: { type: String, default: '' },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date }
    }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

conversationSchema.pre('validate', function setParticipantKey() {
    if (this.participants?.length === 2) {
        this.participantKey = this.participants.map(String).sort().join(':');
    }
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
