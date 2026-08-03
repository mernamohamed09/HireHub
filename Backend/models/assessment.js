const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Jobs", 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  }, // e.g., "Frontend Tech Round"
  ravenAceExamId: { 
    type: String, 
    required: true 
  },
}, { timestamps: true });

const Assessment = mongoose.model("Assessment", assessmentSchema);
module.exports = Assessment;
