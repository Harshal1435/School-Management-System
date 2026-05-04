import { Router } from 'express';
import {
  getResults, getStudentResults, createResult, updateResult, deleteResult,
} from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/student/:studentId', authorize('admin', 'teacher', 'student', 'parent'), getStudentResults);

router.route('/')
  .get(authorize('admin', 'teacher'), getResults)
  .post(authorize('admin', 'teacher'), createResult);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateResult)
  .delete(authorize('admin'), deleteResult);

export default router;
