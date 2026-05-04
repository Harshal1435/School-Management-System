import { Router } from 'express';
import {
  getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getMyProfile,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

// Own profile — must come before /:id
router.get('/my-profile', authorize('teacher'), getMyProfile);

router.route('/')
  .get(authorize('admin', 'accountant'), getTeachers)
  .post(authorize('admin'), createTeacher);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'accountant'), getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

export default router;
