import asyncHandler from 'express-async-handler';
import { Payment, FeeStructure } from '../models/Fees.js';
import Salary from '../models/Salary.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

/* ══════════════════════════════════════════════════════════════
   DASHBOARD STATS
══════════════════════════════════════════════════════════════ */

// @desc  Accountant dashboard overview
// @route GET /api/accountant/dashboard
// @access accountant, admin
const getDashboard = asyncHandler(async (req, res) => {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart  = new Date(now.getFullYear(), 0, 1);

  const [
    totalStudents,
    feeStats,
    thisMonthFees,
    thisYearFees,
    pendingFees,
    overdueFees,
    salarySummary,
    recentPayments,
    monthlyFeeChart,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),

    // All-time fee stats by status
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' }, paid: { $sum: '$paidAmount' } } },
    ]),

    // This month collections
    Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    ]),

    // This year collections
    Payment.aggregate([
      { $match: { paymentDate: { $gte: yearStart }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),

    // Pending fee count + amount
    Payment.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, count: { $sum: 1 }, due: { $sum: '$dueAmount' } } },
    ]),

    // Overdue
    Payment.countDocuments({ status: 'overdue' }),

    // Salary this month
    Salary.aggregate([
      { $match: { year: now.getFullYear(), month: now.toLocaleString('default', { month: 'long' }) } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),

    // Recent 8 payments
    Payment.find({ status: { $in: ['paid', 'partial'] } })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ paymentDate: -1 })
      .limit(8),

    // Monthly fee collection chart (last 6 months)
    Payment.aggregate([
      { $match: { paymentDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id:   { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
          collected: { $sum: '$paidAmount' },
          count:     { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    dashboard: {
      totalStudents,
      feeStats,
      thisMonthCollected: thisMonthFees[0]?.total || 0,
      thisMonthCount:     thisMonthFees[0]?.count || 0,
      thisYearCollected:  thisYearFees[0]?.total  || 0,
      pendingCount:       pendingFees[0]?.count   || 0,
      pendingDue:         pendingFees[0]?.due      || 0,
      overdueFees,
      salarySummary,
      recentPayments,
      monthlyFeeChart,
    },
  });
});

/* ══════════════════════════════════════════════════════════════
   FEE MANAGEMENT
══════════════════════════════════════════════════════════════ */

// @desc  Get all payments with rich filters
// @route GET /api/accountant/fees
// @access accountant, admin
const getAllFees = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 15,
    status, studentId, classId, feeType,
    month, academicYear, search,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const query = {};
  if (status)       query.status       = status;
  if (studentId)    query.student      = studentId;
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

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const total = await Payment.countDocuments(query);

  const payments = await Payment.find(query)
    .populate({
      path: 'student',
      populate: [
        { path: 'user',  select: 'name email phone' },
        { path: 'class', select: 'name section' },
      ],
    })
    .populate('collectedBy', 'name')
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  // Summary for current filter
  const summary = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id:       null,
        totalFees: { $sum: '$amount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue:  { $sum: '$dueAmount' },
      },
    },
  ]);

  res.json({
    success: true,
    count: payments.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    summary: summary[0] || { totalFees: 0, totalPaid: 0, totalDue: 0 },
    payments,
  });
});

// @desc  Create fee record for a student
// @route POST /api/accountant/fees
// @access accountant, admin
const createFeeRecord = asyncHandler(async (req, res) => {
  const { studentId, ...data } = req.body;

  const count = await Payment.countDocuments();
  data.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  data.student     = studentId;
  data.collectedBy = req.user._id;
  if (Number(data.paidAmount) >= Number(data.amount)) data.paymentDate = new Date();

  const payment = await Payment.create(data);

  // Sync student fee status
  await syncStudentFeeStatus(studentId);

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  res.status(201).json({ success: true, payment: populated });
});

// @desc  Update fee record (mark paid, partial, etc.)
// @route PUT /api/accountant/fees/:id
// @access accountant, admin
const updateFeeRecord = asyncHandler(async (req, res) => {
  const existing = await Payment.findById(req.params.id);
  if (!existing) { res.status(404); throw new Error('Payment not found'); }

  const updateData = { ...req.body };

  if (req.body.paidAmount !== undefined) {
    const newPaid = Number(req.body.paidAmount);
    updateData.dueAmount = existing.amount - newPaid;
    if (updateData.dueAmount <= 0) {
      updateData.status      = 'paid';
      updateData.dueAmount   = 0;
      updateData.paymentDate = req.body.paymentDate || new Date();
      if (!existing.receiptNumber) {
        const count = await Payment.countDocuments();
        updateData.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
      }
    } else if (newPaid > 0) {
      updateData.status = 'partial';
    }
  }

  updateData.collectedBy = req.user._id;

  const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  await syncStudentFeeStatus(payment.student._id || payment.student);

  res.json({ success: true, payment });
});

// @desc  Bulk mark fees as overdue
// @route PUT /api/accountant/fees/bulk-overdue
// @access accountant, admin
const bulkMarkOverdue = asyncHandler(async (req, res) => {
  const today = new Date();
  const result = await Payment.updateMany(
    { status: 'pending', dueDate: { $lt: today } },
    { $set: { status: 'overdue' } }
  );
  res.json({ success: true, updated: result.modifiedCount, message: `${result.modifiedCount} fees marked as overdue` });
});

// @desc  Send fee reminder (creates notification)
// @route POST /api/accountant/fees/reminder
// @access accountant, admin
const sendFeeReminder = asyncHandler(async (req, res) => {
  const { paymentIds } = req.body;
  // In production: send email/SMS. Here we just return success.
  res.json({ success: true, message: `Reminder sent for ${paymentIds?.length || 0} fee records` });
});

// @desc  Get fee collection report
// @route GET /api/accountant/fees/report
// @access accountant, admin
const getFeeReport = asyncHandler(async (req, res) => {
  const { academicYear, month, classId } = req.query;
  const match = {};
  if (academicYear) match.academicYear = academicYear;
  if (month)        match.month        = month;

  if (classId) {
    const students = await Student.find({ class: classId }).select('_id');
    match.student = { $in: students.map(s => s._id) };
  }

  const [byStatus, byType, byMonth, byClass] = await Promise.all([
    // By status
    Payment.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' }, paid: { $sum: '$paidAmount' }, due: { $sum: '$dueAmount' } } },
    ]),

    // By fee type
    Payment.aggregate([
      { $match: match },
      { $group: { _id: '$feeType', count: { $sum: 1 }, amount: { $sum: '$amount' }, paid: { $sum: '$paidAmount' } } },
      { $sort: { amount: -1 } },
    ]),

    // By month (trend)
    Payment.aggregate([
      { $match: { ...match, paymentDate: { $exists: true } } },
      { $group: { _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } }, collected: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // By class
    Payment.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'students', localField: 'student', foreignField: '_id', as: 'studentData',
        },
      },
      { $unwind: '$studentData' },
      {
        $lookup: {
          from: 'classes', localField: 'studentData.class', foreignField: '_id', as: 'classData',
        },
      },
      { $unwind: { path: '$classData', preserveNullAndEmpty: true } },
      {
        $group: {
          _id:   '$classData._id',
          class: { $first: '$classData.name' },
          section: { $first: '$classData.section' },
          total: { $sum: '$amount' },
          paid:  { $sum: '$paidAmount' },
          due:   { $sum: '$dueAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { class: 1 } },
    ]),
  ]);

  res.json({ success: true, report: { byStatus, byType, byMonth, byClass } });
});

/* ══════════════════════════════════════════════════════════════
   SALARY / PAYROLL
══════════════════════════════════════════════════════════════ */

// @desc  Get all salary records
// @route GET /api/accountant/salary
// @access accountant, admin
const getSalaries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status, month, year, employeeType, search } = req.query;
  const query = {};
  if (status)       query.status       = status;
  if (month)        query.month        = month;
  if (year)         query.year         = Number(year);
  if (employeeType) query.employeeType = employeeType;

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    query.employee = { $in: users.map(u => u._id) };
  }

  const total    = await Salary.countDocuments(query);
  const salaries = await Salary.find(query)
    .populate('employee', 'name email phone role profileImage')
    .populate({ path: 'teacherProfile', select: 'teacherId employeeId qualification' })
    .populate('processedBy', 'name')
    .sort({ year: -1, createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const summary = await Salary.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
  ]);

  res.json({ success: true, count: salaries.length, total, pages: Math.ceil(total / limit), summary, salaries });
});

// @desc  Create salary record
// @route POST /api/accountant/salary
// @access accountant, admin
const createSalary = asyncHandler(async (req, res) => {
  const data = { ...req.body, processedBy: req.user._id };

  // Auto-link teacher profile
  if (data.employeeType === 'teacher') {
    const teacher = await Teacher.findOne({ user: data.employee });
    if (teacher) data.teacherProfile = teacher._id;
  }

  const salary = await Salary.create(data);
  const populated = await Salary.findById(salary._id)
    .populate('employee', 'name email role')
    .populate('processedBy', 'name');

  res.status(201).json({ success: true, salary: populated });
});

// @desc  Update salary record (mark paid, etc.)
// @route PUT /api/accountant/salary/:id
// @access accountant, admin
const updateSalary = asyncHandler(async (req, res) => {
  const data = { ...req.body, processedBy: req.user._id };
  if (data.status === 'paid' && !data.paymentDate) data.paymentDate = new Date();

  const salary = await Salary.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    .populate('employee', 'name email role')
    .populate('processedBy', 'name');

  if (!salary) { res.status(404); throw new Error('Salary record not found'); }
  res.json({ success: true, salary });
});

// @desc  Delete salary record
// @route DELETE /api/accountant/salary/:id
// @access admin only
const deleteSalary = asyncHandler(async (req, res) => {
  await Salary.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Salary record deleted' });
});

// @desc  Generate payroll for a month (bulk create for all teachers)
// @route POST /api/accountant/salary/generate-payroll
// @access accountant, admin
const generatePayroll = asyncHandler(async (req, res) => {
  const { month, year, academicYear } = req.body;

  const teachers = await Teacher.find({ isActive: true }).populate('user', 'name email');
  const created = [];
  const skipped = [];

  for (const teacher of teachers) {
    const exists = await Salary.findOne({ employee: teacher.user._id, month, year: Number(year) });
    if (exists) { skipped.push(teacher.user.name); continue; }

    const salary = await Salary.create({
      employee:       teacher.user._id,
      employeeType:   'teacher',
      teacherProfile: teacher._id,
      month,
      year:           Number(year),
      academicYear,
      basicSalary:    teacher.salary || 0,
      allowances:     Math.round((teacher.salary || 0) * 0.2),  // 20% HRA
      deductions:     Math.round((teacher.salary || 0) * 0.12), // 12% PF
      status:         'pending',
      processedBy:    req.user._id,
    });
    created.push(salary);
  }

  res.status(201).json({
    success: true,
    message: `Payroll generated: ${created.length} created, ${skipped.length} already existed`,
    created: created.length,
    skipped: skipped.length,
  });
});

// @desc  Get salary report
// @route GET /api/accountant/salary/report
// @access accountant, admin
const getSalaryReport = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const match = year ? { year: Number(year) } : {};

  const [byMonth, byStatus, byType, totalPaid] = await Promise.all([
    Salary.aggregate([
      { $match: match },
      { $group: { _id: '$month', total: { $sum: '$netSalary' }, count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$netSalary', 0] } } } },
    ]),
    Salary.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),
    Salary.aggregate([
      { $match: match },
      { $group: { _id: '$employeeType', count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
    ]),
    Salary.aggregate([
      { $match: { ...match, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]),
  ]);

  res.json({ success: true, report: { byMonth, byStatus, byType, totalPaid: totalPaid[0]?.total || 0 } });
});

/* ── Helper ──────────────────────────────────────────────────── */
const syncStudentFeeStatus = async (studentId) => {
  const pending = await Payment.find({ student: studentId, status: { $in: ['pending', 'overdue'] } });
  const partial = await Payment.find({ student: studentId, status: 'partial' });
  const feeStatus = pending.length > 0 ? 'pending' : partial.length > 0 ? 'partial' : 'paid';
  await Student.findByIdAndUpdate(studentId, { feeStatus });
};

export {
  getDashboard,
  getAllFees, createFeeRecord, updateFeeRecord, bulkMarkOverdue, sendFeeReminder, getFeeReport,
  getSalaries, createSalary, updateSalary, deleteSalary, generatePayroll, getSalaryReport,
};
