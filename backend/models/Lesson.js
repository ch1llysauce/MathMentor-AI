import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: ['Algebra', 'Geometry', 'Trigonometry']
  },
  subtopic: {
    type: String,
    required: true
  },
  moduleNumber: {
    type: Number,
    required: false // Optional for backward compatibility
  },
  moduleName: {
    type: String,
    required: false // Optional for backward compatibility
  },
  order: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  difficultyLevels: {
    type: [String],
    enum: ['Easy', 'Medium', 'Hard'],
    default: ['Easy', 'Medium', 'Hard']
  },
  learningObjectives: {
    type: [String],
    default: []
  },
  content: {
    introduction: String,
    sections: [{
      title: String,
      content: String,
      examples: [{
        problem: String,
        solution: String,
        steps: [String]
      }]
    }],
    summary: String,
    keyTakeaways: [String]
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  estimatedTime: {
    type: Number, // in minutes
    default: 15
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
lessonSchema.index({ topic: 1, subtopic: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
