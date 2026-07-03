import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    topic: {
        type: String,
        required: true,
        enum: ["Algebra", "Geometry", "Trigonometry"]
    },

    subtopic: {
        type: String,
        trim: true
    },

    masteryLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    lessonsCompleted: {
        type: Number,
        default: 0,
        min: 0
    },

    questionsAnswered: {
        type: Number,
        default: 0,
        min: 0
    },

    correctAnswers: {
        type: Number,
        default: 0,
        min: 0
    },

    accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    averageResponseTime: {
        type: Number,
        default: 0 // in seconds
    },

    currentDifficulty: {
        type: String,
        default: "Easy",
        enum: ["Easy", "Medium", "Hard"]
    },

    streakDays: {
        type: Number,
        default: 0
    },

    totalStudyTime: {
        type: Number,
        default: 0 // in seconds
    },

    weakAreas: [{
        area: String,
        failureCount: {
            type: Number,
            default: 0
        }
    }],

    lastStudied: {
        type: Date,
        default: Date.now
    }

},
{
    timestamps: true
});

// Index for faster queries
progressSchema.index({ user: 1, topic: 1 });

export default mongoose.model("Progress", progressSchema);