import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;
    let query = {};

    if (assignmentId) {
      query.assignment = assignmentId;
    }

    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const submissions = await Submission.find(query)
      .populate('assignment', 'title totalMarks dueDate')
      .populate('student', 'name email studentId')
      .populate('gradedBy', 'name email')
      .sort('-createdAt');

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate('student', 'name email studentId')
      .populate('gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (
      req.user.role === 'student' &&
      submission.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create submission
// @route   POST /api/submissions
// @access  Private (Student)
export const createSubmission = async (req, res) => {
  try {
    const { assignment, content, attachments } = req.body;

    const assignmentExists = await Assignment.findById(assignment);

    if (!assignmentExists) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const existingSubmission = await Submission.findOne({
      assignment,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const isLate = new Date() > assignmentExists.dueDate;

    const submission = await Submission.create({
      assignment,
      student: req.user._id,
      content,
      attachments,
      status: isLate ? 'late' : 'submitted',
      submittedAt: new Date()
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update submission (before grading)
// @route   PUT /api/submissions/:id
// @access  Private (Student)
export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }

    if (submission.status === 'graded') {
      return res.status(400).json({ message: 'Cannot update graded submission' });
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher)
export const gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment._id);

    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }

    if (marksObtained > assignment.totalMarks) {
      return res.status(400).json({ 
        message: `Marks cannot exceed ${assignment.totalMarks}` 
      });
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student/Teacher)
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (
      submission.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'teacher'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }

    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Submission removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student analytics
// @route   GET /api/submissions/analytics/student
// @access  Private (Student)
export const getStudentAnalytics = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      student: req.user._id,
      status: 'graded'
    }).populate('assignment', 'totalMarks course');

    const totalSubmissions = submissions.length;
    const totalMarks = submissions.reduce((sum, sub) => sum + sub.marksObtained, 0);
    const totalPossible = submissions.reduce((sum, sub) => sum + sub.assignment.totalMarks, 0);
    const averagePercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;

    res.json({
      totalSubmissions,
      totalMarks,
      totalPossible,
      averagePercentage,
      submissions: submissions.map(sub => ({
        title: sub.assignment.title,
        marksObtained: sub.marksObtained,
        totalMarks: sub.assignment.totalMarks,
        percentage: ((sub.marksObtained / sub.assignment.totalMarks) * 100).toFixed(2)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};