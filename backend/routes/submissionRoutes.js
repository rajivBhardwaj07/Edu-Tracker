import express from 'express';
import {
  getSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission,
  getStudentAnalytics
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getSubmissions);
router.post('/', protect, authorize('student'), createSubmission);
router.get('/analytics/student', protect, authorize('student'), getStudentAnalytics);
router.get('/:id', protect, getSubmission);
router.put('/:id', protect, authorize('student'), updateSubmission);
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);
router.delete('/:id', protect, deleteSubmission);

export default router;