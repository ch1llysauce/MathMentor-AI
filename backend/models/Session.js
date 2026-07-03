import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sessionType: {
        type: String,
        required: true,
        enum: ["Diagnostic", "Practice", "Tutor", "Review"]
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

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"]
    },

    questions: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        },
        userAnswer: String,
        isCorrect: Boolean,
        timeSpent: Number, // in seconds
        hintsUsed: {
            type: Number,
            default: 0
        },
        aiInteractions: [{
            userMessage: String,
            aiResponse: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }]
    }],

    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    questionsAttempted: {
        type: Number,
        default: 0
    },

    correctAnswers: {
        type: Number,
        default: 0
    },

    totalTimeSpent: {
        type: Number,
        default: 0 // in seconds
    },

    isCompleted: {
        type: Boolean,
        default: false
    },

    completedAt: {
        type: Date
    },

    learningPath: [{
        topic: String,
        subtopic: String,
        priority: {
            type: Number,
            default: 1
        },
        status: {
            type: String,
            enum: ["Pending", "InProgress", "Completed"],
            default: "Pending"
        }
    }]

},
{
    timestamps: true
});

// Index for faster queries
sessionSchema.index({ user: 1, sessionType: 1, createdAt: -1 });

export default mongoose.model("Session", sessionSchema);
