import { Router } from 'express';
import { getClasses, getClass, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(authorize('admin'), createClass);

router.route('/:id')
  .get(getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

export default router;
