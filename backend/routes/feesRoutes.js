import { Router } from 'express';
import {
  getFeeStructures, createFeeStructure,
  getPayments, createPayment, updatePayment,
  getStudentFees, getFeeStats, getChildrenFees,
} from '../controllers/feesController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/stats',                      authorize('admin', 'accountant'), getFeeStats);
router.get('/parent/children',            authorize('parent'), getChildrenFees);
router.get('/student/:studentId',         authorize('admin', 'accountant', 'student', 'parent'), getStudentFees);

router.route('/structure')
  .get(authorize('admin', 'accountant', 'teacher'), getFeeStructures)
  .post(authorize('admin', 'accountant'), createFeeStructure);

router.route('/')
  .get(authorize('admin', 'accountant'), getPayments)
  .post(authorize('admin', 'accountant'), createPayment);

router.put('/:id', authorize('admin', 'accountant', 'parent', 'student'), updatePayment);

export default router;
