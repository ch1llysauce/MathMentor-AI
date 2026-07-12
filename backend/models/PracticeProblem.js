import mongoose from 'mongoose';

const practiceProblemSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: ['Algebra', 'Geometry', 'Trigonometry']
  },
  subtopic: {
    type: String,
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'free-response', 'true-false'],
    default: 'multiple-choice'
  },
  problem: {
    text: {
      type: String,
      required: true
    },
    latex: String, // LaTeX formula if applicable
    image: String  // Image URL if needed
  },
  options: [{
    text: String,
    latex: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String  // For free-response questions
  },
  explanation: {
    type: String,
    required: true
  },
  solution: {
    steps: [String],
    finalAnswer: String
  },
  hints: [String],
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Index for efficient queries
practiceProblemSchema.index({ topic: 1, subtopic: 1, difficulty: 1 });
practiceProblemSchema.index({ lessonId: 1 });

const PracticeProblem = mongoose.model('PracticeProblem', practiceProblemSchema);

export default PracticeProblem;
