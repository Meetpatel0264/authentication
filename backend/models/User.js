const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpire: {
            type: Date,
            default: null,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);