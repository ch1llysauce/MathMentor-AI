import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: ""
    },

    gradeLevel: {
        type: Number,
        enum: [9, 10, 11, 12]
    },

    focusAreas: [{
        type: String,
        enum: [
            "Algebra",
            "Geometry",
            "Trigonometry"
        ]
    }],

    learningPreferences: {
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy"
        },
        studyTimeGoal: {
            type: Number,
            default: 30 // minutes per day
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    },

    diagnosticCompleted: {
        type: Boolean,
        default: false
    },

    lastDiagnosticDate: {
        type: Date
    },

    totalStudyTime: {
        type: Number,
        default: 0 // in seconds
    },

    currentStreak: {
        type: Number,
        default: 0
    },

    longestStreak: {
        type: Number,
        default: 0
    },

    lastActiveDate: {
        type: Date,
        default: Date.now
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);