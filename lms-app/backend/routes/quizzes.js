const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create new quiz (teachers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create quizzes' });
    }

    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to create quiz for this course' });
    }

    const quiz = new Quiz(req.body);
    await quiz.save();

    // Add quiz to course module
    const module = course.modules.find(m => m._id.toString() === req.body.module);
    if (module) {
      module.content.push({
        type: 'quiz',
        title: quiz.title,
        description: quiz.description,
        quiz: quiz._id
      });
      await course.save();
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // For students, remove correct answers
    if (req.user.role === 'student') {
      const quizForStudent = quiz.toObject();
      delete quizForStudent.questions.map(q => q.correctAnswer);
      res.json(quizForStudent);
    } else {
      res.json(quiz);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz attempt
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit quiz attempts' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if student has exceeded max attempts
    const studentAttempts = quiz.attempts.filter(
      attempt => attempt.student.toString() === req.user.userId
    );

    if (studentAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts exceeded' });
    }

    // Calculate score
    let score = 0;
    const answers = req.body.answers;

    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        score += quiz.questions[i].points;
      }
    }

    const percentage = (score / quiz.questions.reduce((acc, q) => acc + q.points, 0)) * 100;

    // Record attempt
    quiz.attempts.push({
      student: req.user.userId,
      score: percentage,
      answers: answers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswer: answer
      })),
      completedAt: new Date()
    });

    await quiz.save();

    // Update course progress if quiz is passed
    if (percentage >= quiz.passingScore) {
      const course = await Course.findOne({ 'modules.content.quiz': quiz._id });
      if (course) {
        const studentProgress = course.enrolledStudents.find(
          student => student.student.toString() === req.user.userId
        );

        if (studentProgress) {
          const module = course.modules.find(m => 
            m.content.some(c => c.quiz?.toString() === quiz._id.toString())
          );

          if (module) {
            studentProgress.progress.quizScores.push({
              quizId: quiz._id,
              score: percentage,
              attempts: studentAttempts.length + 1
            });

            await course.save();
          }
        }
      }
    }

    res.json({
      score: percentage,
      passed: percentage >= quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      attemptsRemaining: quiz.maxAttempts - (studentAttempts.length + 1)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz results (teachers only)
router.get('/:id/results', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view quiz results' });
    }

    const quiz = await Quiz.findById(req.params.id)
      .populate('attempts.student', 'name email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz.attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 