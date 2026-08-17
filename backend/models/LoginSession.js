import mongoose from "mongoose";

const loginSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Unique token identifier (jti claim stored in JWT)
    tokenId: {
        type: String,
        required: true,
        unique: true
    },

    // Device/platform info parsed from the request
    deviceInfo: {
        type: String,
        default: "Unknown device"
    },

    ipAddress: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: "Manila, Philippines"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastActiveAt: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    revokedAt: {
        type: Date
    }
});

loginSessionSchema.index({ user: 1, isActive: 1 });

export default mongoose.model("LoginSession", loginSessionSchema);
