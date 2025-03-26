const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
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

// Create new course (teachers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user.userId
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' })
      .populate('instructor', 'name email')
      .select('-enrolledStudents');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll in a course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user.userId
    );

    if (isEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to enrolled students
    course.enrolledStudents.push({
      student: req.user.userId
    });

    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { enrolledCourses: course._id }
    });

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update course progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { moduleId, completed } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const studentProgress = course.enrolledStudents.find(
      student => student.student.toString() === req.user.userId
    );

    if (!studentProgress) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    if (completed) {
      // Add completed module if not already completed
      if (!studentProgress.progress.completedModules.some(
        module => module.moduleId.toString() === moduleId
      )) {
        studentProgress.progress.completedModules.push({
          moduleId,
          completedAt: new Date()
        });
      }

      // Update overall progress
      const totalModules = course.modules.length;
      const completedModules = studentProgress.progress.completedModules.length;
      studentProgress.progress.overallProgress = (completedModules / totalModules) * 100;

      // Check if course is completed
      if (studentProgress.progress.overallProgress >= 100) {
        // Generate certificate
        const certificateId = `CERT-${Date.now()}-${req.user.userId}`;
        await User.findByIdAndUpdate(req.user.userId, {
          $push: {
            certificates: {
              course: course._id,
              issuedDate: new Date(),
              certificateId
            }
          }
        });
      }
    }

    await course.save();
    res.json(studentProgress.progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update course (teachers only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update courses' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 