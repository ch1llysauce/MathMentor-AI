import mongoose from "mongoose";

const diagnosticResultSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Detailed scores per topic
    topicScores: {
        algebra: {
            score: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            questionsAnswered: {
                type: Number,
                default: 0
            },
            correctAnswers: {
                type: Number,
                default: 0
            },
            subtopicScores: {
                fractions: { type: Number, default: 0 },
                linearEquations: { type: Number, default: 0 },
                factoring: { type: Number, default: 0 }
            }
        },
        geometry: {
            score: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            questionsAnswered: {
                type: Number,
                default: 0
            },
            correctAnswers: {
                type: Number,
                default: 0
            },
            subtopicScores: {
                angles: { type: Number, default: 0 },
                triangles: { type: Number, default: 0 },
                area: { type: Number, default: 0 },
                basicCircles: { type: Number, default: 0 }
            }
        },
        trigonometry: {
            score: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            questionsAnswered: {
                type: Number,
                default: 0
            },
            correctAnswers: {
                type: Number,
                default: 0
            },
            subtopicScores: {
                sohCahToa: { type: Number, default: 0 },
                basicTrigRatios: { type: Number, default: 0 },
                simpleApplications: { type: Number, default: 0 }
            }
        }
    },

    // Legacy fields for backward compatibility
    algebraScore: {
        type: Number,
        default: 0,
        min: 0
    },

    geometryScore: {
        type: Number,
        default: 0,
        min: 0
    },

    trigonometryScore: {
        type: Number,
        default: 0,
        min: 0
    },

    weakTopics: [{
        topic: {
            type: String,
            enum: ["Algebra", "Geometry", "Trigonometry"]
        },
        subtopic: String,
        score: Number
    }],

    strongTopics: [{
        topic: {
            type: String,
            enum: ["Algebra", "Geometry", "Trigonometry"]
        },
        subtopic: String,
        score: Number
    }],

    recommendedLearningPath: [{
        topic: String,
        subtopic: String,
        priority: {
            type: Number,
            default: 1
        },
        reason: String
    }],

    totalQuestions: {
        type: Number,
        default: 0
    },

    correctAnswers: {
        type: Number,
        default: 0
    },

    overallScore: {
        type: Number,
        default: 0
    },

    timeSpent: {
        type: Number,
        default: 0 // in seconds
    },

    questionResponses: [{
        questionText: String,
        topic: String,
        subtopic: String,
        difficulty: String,
        choices: [String],
        correctAnswer: String,
        userAnswer: String,
        isCorrect: Boolean,
        explanation: String
    }],

    completedAt: {
        type: Date,
        default: Date.now
    }

},
{
    timestamps: true
});

// Index for faster queries
diagnosticResultSchema.index({ user: 1, completedAt: -1 });

export default mongoose.model("DiagnosticResult", diagnosticResultSchema);