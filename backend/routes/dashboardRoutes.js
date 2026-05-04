import { Router } from 'express';
import {
  getAdminDashboard, getTeacherDashboard, getStudentDashboard, getParentDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/admin',   authorize('admin'),   getAdminDashboard);
router.get('/teacher', authorize('teacher'), getTeacherDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/parent',  authorize('parent'),  getParentDashboard);

export default router;
