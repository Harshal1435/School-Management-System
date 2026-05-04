import { Router } from 'express';
import {
  getAttendance, markAttendance, getAttendanceSummary, getClassAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getAttendance)
  .post(authorize('admin', 'teacher'), markAttendance);

router.get('/summary/:studentId', authorize('admin', 'teacher', 'student', 'parent'), getAttendanceSummary);
router.get('/class/:classId',     authorize('admin', 'teacher'), getClassAttendance);

export default router;
