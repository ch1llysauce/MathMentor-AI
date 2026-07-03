import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
{
    topic: {
        type: String,
        required: true,
        enum: ["Algebra", "Geometry", "Trigonometry"]
    },

    subtopic: {
        type: String,
        required: true,
        trim: true,
        enum: [
            // Algebra subtopics
            "Fractions",
            "Linear Equations",
            "Factoring",
            // Geometry subtopics
            "Angles",
            "Triangles",
            "Area",
            "Basic Circles",
            // Trigonometry subtopics
            "SOH-CAH-TOA",
            "Basic Trig Ratios",
            "Simple Applications"
        ]
    },

    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"]
    },

    question: {
        type: String,
        required: true,
        trim: true
    },

    questionType: {
        type: String,
        enum: ["Multiple Choice", "Short Answer", "Step-by-Step"],
        default: "Multiple Choice"
    },

    choices: [{
        type: String
    }],

    correctAnswer: {
        type: String,
        required: true
    },

    explanation: {
        type: String,
        required: true
    },

    hints: [{
        type: String
    }],

    solution_steps: [{
        step: String,
        explanation: String
    }],

    source: {
        type: String,
        default: "System",
        enum: ["System", "AI-Generated", "Manual"]
    },

    isDiagnostic: {
        type: Boolean,
        default: false
    },

    tags: [{
        type: String
    }],

    usageCount: {
        type: Number,
        default: 0
    },

    averageAccuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }

},
{
    timestamps: true
});

// Index for faster queries
questionSchema.index({ topic: 1, subtopic: 1, difficulty: 1 });

export default mongoose.model("Question", questionSchema);