/**
 * Accountant dashboard routes
 * All routes require: protect + authorize('admin', 'accountant')
 */
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { Payment, FeeStructure } from '../models/Fees.js';
import Salary from '../models/Salary.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

const router = Router();
router.use(protect);
router.use(authorize('admin', 'accountant'));

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const now        = new Date();
  const thisMonth  = now.toLocaleString('default', { month: 'long' });
  const thisYear   = now.getFullYear();
  const yearStart  = new Date(thisYear, 0, 1);

  const [
    totalStudents, totalTeachers,
    feeStats, salarySummary,
    recentPayments, pendingInfo, overdueCount,
    thisMonthFees, thisYearFees, monthlyFeeChart,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),

    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, paid: { $sum: '$paidAmount' }, total: { $sum: '$amount' } } },
    ]),

    Salary.aggregate([
      { $match: { month: thisMonth, year: thisYear } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),

    Payment.find({ status: 'paid' })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ paymentDate: -1 })
      .limit(8),

    Payment.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, count: { $sum: 1 }, due: { $sum: '$dueAmount' } } },
    ]),

    Payment.countDocuments({ status: 'overdue' }),

    // This month collected
    Payment.aggregate([
      { $match: { status: 'paid', paymentDate: { $gte: new Date(thisYear, now.getMonth(), 1) } } },
      { $group: { _id: null, collected: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    ]),

    // This year collected
    Payment.aggregate([
      { $match: { status: 'paid', paymentDate: { $gte: yearStart } } },
      { $group: { _id: null, collected: { $sum: '$paidAmount' } } },
    ]),

    // Monthly chart — last 6 months
    Payment.aggregate([
      { $match: { status: 'paid', paymentDate: { $gte: new Date(thisYear, now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
        collected: { $sum: '$paidAmount' },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    dashboard: {
      totalStudents,
      totalTeachers,
      feeStats,
      salarySummary,
      recentPayments,
      pendingDue:          pendingInfo[0]?.due   || 0,
      pendingCount:        pendingInfo[0]?.count || 0,
      overdueFees:         overdueCount,
      thisMonthCollected:  thisMonthFees[0]?.collected || 0,
      thisMonthCount:      thisMonthFees[0]?.count     || 0,
      thisYearCollected:   thisYearFees[0]?.collected  || 0,
      monthlyFeeChart,
    },
  });
}));

/* ══════════════════════════════════════════════════════════════
   FEES
══════════════════════════════════════════════════════════════ */

// GET /accountant/fees — list with filters + summary
router.get('/fees', asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status, feeType, month, classId, search, academicYear } = req.query;
  const query = {};

  if (status)       query.status       = status;
  if (feeType)      query.feeType      = feeType;
  if (month)        query.month        = month;
  if (academicYear) query.academicYear = academicYear;

  // Search by student name
  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const students = await Student.find({ user: { $in: users.map(u => u._id) } }).select('_id');
    query.student = { $in: students.map(s => s._id) };
  }

  // Filter by class
  if (classId) {
    const students = await Student.find({ class: classId }).select('_id');
    query.student = { $in: students.map(s => s._id) };
  }

  const total    = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate({
      path: 'student',
      populate: [
        { path: 'user',  select: 'name email' },
        { path: 'class', select: 'name section' },
      ],
    })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  // Summary totals for this query
  const totals = await Payment.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalFees: { $sum: '$amount' },
      totalPaid: { $sum: '$paidAmount' },
      totalDue:  { $sum: '$dueAmount' },
    }},
  ]);

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    payments,
    summary: totals[0] || { totalFees: 0, totalPaid: 0, totalDue: 0 },
  });
}));

// POST /accountant/fees — create fee record
router.post('/fees', asyncHandler(async (req, res) => {
  const { studentId, ...rest } = req.body;
  const count = await Payment.countDocuments();
  const data  = {
    ...rest,
    student:       studentId,
    collectedBy:   req.user._id,
    receiptNumber: rest.paidAmount >= rest.amount
      ? `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`
      : undefined,
  };
  if (data.paidAmount >= data.amount) data.paymentDate = new Date();

  const payment = await Payment.create(data);
  const populated = await Payment.findById(payment._id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  res.status(201).json({ success: true, payment: populated });
}));

// PUT /accountant/fees/bulk-overdue — mark past-due pending fees as overdue
router.put('/fees/bulk-overdue', asyncHandler(async (req, res) => {
  const result = await Payment.updateMany(
    { status: 'pending', dueDate: { $lt: new Date() } },
    { status: 'overdue' }
  );
  res.json({ success: true, message: `${result.modifiedCount} fees marked as overdue` });
}));

// PUT /accountant/fees/:id — update a fee record
router.put('/fees/:id', asyncHandler(async (req, res) => {
  const existing = await Payment.findById(req.params.id);
  if (!existing) { res.status(404); throw new Error('Payment not found'); }

  const update = { ...req.body };

  // Recalculate status when paidAmount changes
  if (update.paidAmount !== undefined) {
    const paid = Number(update.paidAmount);
    update.dueAmount = existing.amount - paid;
    if (update.dueAmount <= 0) {
      update.status    = 'paid';
      update.dueAmount = 0;
      if (!update.paymentDate) update.paymentDate = new Date();
      if (!existing.receiptNumber) {
        const count = await Payment.countDocuments();
        update.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
      }
    } else if (paid > 0) {
      update.status = 'partial';
    }
  }

  const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  // Sync student feeStatus
  const sid = payment.student?._id || payment.student;
  const pending = await Payment.find({ student: sid, status: { $in: ['pending', 'overdue'] } });
  const partial = await Payment.find({ student: sid, status: 'partial' });
  await Student.findByIdAndUpdate(sid, {
    feeStatus: pending.length > 0 ? 'pending' : partial.length > 0 ? 'partial' : 'paid',
  });

  res.json({ success: true, payment });
}));

/* ══════════════════════════════════════════════════════════════
   SALARY
══════════════════════════════════════════════════════════════ */

// GET /accountant/salary — list with filters
router.get('/salary', asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, month, year, status, employeeType, search } = req.query;
  const query = {};

  if (month)        query.month        = month;
  if (year)         query.year         = Number(year);
  if (status)       query.status       = status;
  if (employeeType) query.employeeType = employeeType;

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    query.employee = { $in: users.map(u => u._id) };
  }

  const total    = await Salary.countDocuments(query);
  const salaries = await Salary.find(query)
    .populate('employee', 'name email role')
    .populate('processedBy', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ year: -1, createdAt: -1 });

  const summary = await Salary.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
  ]);

  res.json({ success: true, total, pages: Math.ceil(total / limit), salaries, summary });
}));

// POST /accountant/salary — create salary record
router.post('/salary', asyncHandler(async (req, res) => {
  const data = { ...req.body, processedBy: req.user._id };

  if (data.employeeType === 'teacher' && data.employee) {
    const tp = await Teacher.findOne({ user: data.employee });
    if (tp) data.teacherProfile = tp._id;
  }

  const salary = await Salary.create(data);
  const populated = await Salary.findById(salary._id).populate('employee', 'name email role');
  res.status(201).json({ success: true, salary: populated });
}));

// POST /accountant/salary/generate-payroll — bulk generate for all teachers
router.post('/salary/generate-payroll', asyncHandler(async (req, res) => {
  const { month, year, academicYear } = req.body;
  if (!month || !year) { res.status(400); throw new Error('month and year are required'); }

  const teachers = await Teacher.find({ isActive: true }).populate('user', 'name email');
  const created = [];
  const skipped = [];

  for (const teacher of teachers) {
    const exists = await Salary.findOne({ employee: teacher.user._id, month, year: Number(year) });
    if (exists) { skipped.push(teacher.user.name); continue; }

    await Salary.create({
      employee:       teacher.user._id,
      employeeType:   'teacher',
      teacherProfile: teacher._id,
      month,
      year:           Number(year),
      academicYear:   academicYear || `${year}-${String(Number(year) + 1).slice(-2)}`,
      basicSalary:    teacher.salary || 30000,
      allowances:     Math.round((teacher.salary || 30000) * 0.2),
      deductions:     Math.round((teacher.salary || 30000) * 0.1),
      status:         'pending',
      processedBy:    req.user._id,
    });
    created.push(teacher.user.name);
  }

  res.status(201).json({
    success: true,
    message: `Generated ${created.length} salary records. Skipped ${skipped.length} (already exist).`,
    created: created.length,
    skipped: skipped.length,
  });
}));

// PUT /accountant/salary/:id — update salary record
router.put('/salary/:id', asyncHandler(async (req, res) => {
  const update = { ...req.body, processedBy: req.user._id };
  if (update.status === 'paid' && !update.paymentDate) update.paymentDate = new Date();

  const salary = await Salary.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('employee', 'name email role');

  if (!salary) { res.status(404); throw new Error('Salary record not found'); }
  res.json({ success: true, salary });
}));

// DELETE /accountant/salary/:id
router.delete('/salary/:id', asyncHandler(async (req, res) => {
  await Salary.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Salary record deleted' });
}));

export default router;
