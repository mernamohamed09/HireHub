const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    salary: {
        type: Number,
        default: null,
        min: [0, 'Salary must be positive']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
},
{timestamps:true});



const Jobs = mongoose.model("Jobs", jobSchema);
module.exports = Jobs;