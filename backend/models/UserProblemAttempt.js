import mongoose from 'mongoose';

const userProblemAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeProblem',
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
userProblemAttemptSchema.index({ user: 1, problem: 1 });
userProblemAttemptSchema.index({ user: 1, createdAt: -1 });

const UserProblemAttempt = mongoose.model('UserProblemAttempt', userProblemAttemptSchema);

export default UserProblemAttempt;
