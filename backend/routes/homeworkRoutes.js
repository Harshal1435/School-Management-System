import { Router } from 'express';
import {
  getHomework, getClassHomework, getSingleHomework,
  createHomework, updateHomework, deleteHomework,
} from '../controllers/homeworkController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/class/:classId', getClassHomework);

router.route('/')
  .get(authorize('admin', 'teacher'), getHomework)
  .post(authorize('admin', 'teacher'), createHomework);

router.route('/:id')
  .get(getSingleHomework)
  .put(authorize('admin', 'teacher'), updateHomework)
  .delete(authorize('admin', 'teacher'), deleteHomework);

export default router;
