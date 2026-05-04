import { Router } from 'express';
import {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

// Own profile — must come before /:id
router.get('/my-profile', authorize('student'), getMyProfile);

router.route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudent);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

export default router;
