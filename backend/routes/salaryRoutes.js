import { Router } from 'express';
import {
  getSalaries, getSalaryStats, getSalary,
  createSalary, updateSalary, deleteSalary, bulkGenerateSalary,
} from '../controllers/salaryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'accountant'));

// Stats + bulk — before /:id to avoid param conflict
router.get('/stats',          getSalaryStats);
router.post('/bulk-generate', bulkGenerateSalary);

router.route('/')
  .get(getSalaries)
  .post(createSalary);

router.route('/:id')
  .get(getSalary)
  .put(updateSalary)
  .delete(authorize('admin'), deleteSalary);

export default router;
