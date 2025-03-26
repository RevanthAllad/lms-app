const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modules: [{
    title: String,
    description: String,
    content: [{
      type: {
        type: String,
        enum: ['video', 'document', 'quiz'],
        required: true
      },
      title: String,
      description: String,
      url: String, // For video/document URLs
      duration: Number, // In minutes
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      }
    }],
    order: Number
  }],
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // Total course duration in minutes
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      completedModules: [{
        moduleId: mongoose.Schema.Types.ObjectId,
        completedAt: Date
      }],
      quizScores: [{
        quizId: mongoose.Schema.Types.ObjectId,
        score: Number,
        attempts: Number
      }],
      overallProgress: {
        type: Number,
        default: 0
      }
    }
  }],
  requirements: [String],
  objectives: [String],
  thumbnail: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema); 