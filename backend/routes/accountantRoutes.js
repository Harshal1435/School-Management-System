import { Router } from 'express';
import {
  getDashboard,
  getAllFees, createFeeRecord, updateFeeRecord, bulkMarkOverdue, sendFeeReminder, getFeeReport,
  getSalaries, createSalary, updateSalary, deleteSalary, generatePayroll, getSalaryReport,
} from '../controllers/accountantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require login + accountant or admin role
router.use(protect);
router.use(authorize('accountant', 'admin'));

// ── Dashboard ─────────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ── Fee Management ────────────────────────────────────────────
router.get('/fees/report',          getFeeReport);
router.put('/fees/bulk-overdue',    bulkMarkOverdue);
router.post('/fees/reminder',       sendFeeReminder);
router.route('/fees')
  .get(getAllFees)
  .post(createFeeRecord);
router.put('/fees/:id',             updateFeeRecord);

// ── Salary / Payroll ──────────────────────────────────────────
router.get('/salary/report',        getSalaryReport);
router.post('/salary/generate-payroll', generatePayroll);
router.route('/salary')
  .get(getSalaries)
  .post(createSalary);
router.route('/salary/:id')
  .put(updateSalary)
  .delete(authorize('admin'), deleteSalary);

export default router;
