import { Router } from 'express';
import { getSubjects, getSubject, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(authorize('admin'), createSubject);

router.route('/:id')
  .get(getSubject)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

export default router;
