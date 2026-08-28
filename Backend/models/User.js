const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["candidate", "company", "admin"],
            default: "candidate",
        },
        phone: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        
        profileImage: {
            type: String,
            default: '',
        },

        isActive: {
            type: Boolean,
            default: true,
        },

    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;