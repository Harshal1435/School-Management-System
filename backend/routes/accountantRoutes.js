/**
 * Accountant dashboard routes
 * Aggregates fee + salary data for the accountant role
 */
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { Payment, FeeStructure } from '../models/Fees.js';
import Salary from '../models/Salary.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';

const router = Router();
router.use(protect);
router.use(authorize('admin', 'accountant'));

// ── GET /api/accountant/dashboard ─────────────────────────────
router.get('/dashboard', asyncHandler(async (req, res) => {
  const now = new Date();
  const thisMonth = now.toLocaleString('default', { month: 'long' });
  const thisYear  = now.getFullYear();

  const [
    totalStudents,
    totalTeachers,
    totalStaff,
    feeStats,
    salaryStats,
    recentPayments,
    pendingFees,
    pendingSalaries,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true, role: { $in: ['teacher', 'accountant', 'admin'] } }),

    // Fee collection this month
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' }, paid: { $sum: '$paidAmount' } } },
    ]),

    // Salary this month
    Salary.aggregate([
      { $match: { month: thisMonth, year: thisYear } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),

    // Recent 5 fee payments
    Payment.find({ status: 'paid' })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ paymentDate: -1 })
      .limit(5),

    // Pending fee count + amount
    Payment.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, count: { $sum: 1 }, due: { $sum: '$dueAmount' } } },
    ]),

    // Pending salary this month
    Salary.aggregate([
      { $match: { month: thisMonth, year: thisYear, status: 'pending' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalTeachers,
      totalStaff,
      feeStats,
      salaryStats,
      recentPayments,
      pendingFees:     pendingFees[0]    || { count: 0, due: 0 },
      pendingSalaries: pendingSalaries[0] || { count: 0, total: 0 },
      thisMonth,
      thisYear,
    },
  });
}));

// ── GET /api/accountant/fee-report ────────────────────────────
router.get('/fee-report', asyncHandler(async (req, res) => {
  const { academicYear, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (academicYear) query.academicYear = academicYear;
  if (status)       query.status       = status;

  const total    = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  // Totals
  const totals = await Payment.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalPaid:   { $sum: '$paidAmount' },
      totalDue:    { $sum: '$dueAmount' },
    }},
  ]);

  res.json({ success: true, total, pages: Math.ceil(total / limit), payments, totals: totals[0] || {} });
}));

// ── PUT /api/accountant/fees/:id/mark-paid ────────────────────
router.put('/fees/:id/mark-paid', asyncHandler(async (req, res) => {
  const { paymentMethod = 'cash', transactionId, remarks } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) { res.status(404); throw new Error('Payment not found'); }

  payment.paidAmount    = payment.amount;
  payment.dueAmount     = 0;
  payment.status        = 'paid';
  payment.paymentDate   = new Date();
  payment.paymentMethod = paymentMethod;
  if (transactionId) payment.transactionId = transactionId;
  if (remarks)       payment.remarks       = remarks;
  payment.collectedBy = req.user._id;

  // Generate receipt if missing
  if (!payment.receiptNumber) {
    const count = await Payment.countDocuments();
    payment.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  }

  await payment.save();

  // Sync student fee status
  const pending = await Payment.find({ student: payment.student, status: { $in: ['pending', 'overdue'] } });
  const partial = await Payment.find({ student: payment.student, status: 'partial' });
  const feeStatus = pending.length > 0 ? 'pending' : partial.length > 0 ? 'partial' : 'paid';
  await Student.findByIdAndUpdate(payment.student, { feeStatus });

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  res.json({ success: true, payment: populated });
}));

// ── PUT /api/accountant/fees/:id/waive ────────────────────────
router.put('/fees/:id/waive', asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status: 'paid', dueAmount: 0, remarks: remarks || 'Fee waived by accountant', collectedBy: req.user._id },
    { new: true }
  );
  if (!payment) { res.status(404); throw new Error('Payment not found'); }
  res.json({ success: true, payment });
}));

export default router;
