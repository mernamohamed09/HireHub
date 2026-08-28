const mongoose = require('mongoose');

const candidateInvitationSchema = new mongoose.Schema({
  application: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Application", 
    required: true 
  },
  assessment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Assessment", 
    required: true 
  },
  ravenAceInvitationId: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['not_started', 'registered', 'in_progress', 'grading', 'completed', 'error', 'expired', 'pending'], // Includes all RavenACE attempt statuses and invitation fallback statuses
    default: 'not_started'
  },
  score: {
    type: Number,
    default: null
  },
  passed: {
    type: Boolean,
    default: null
  }
}, { timestamps: true });

// A candidate shouldn't be invited to the SAME assessment twice
candidateInvitationSchema.index({ application: 1, assessment: 1 }, { unique: true });

const CandidateInvitation = mongoose.model("CandidateInvitation", candidateInvitationSchema);
module.exports = CandidateInvitation;
