import asyncHandler from 'express-async-handler';
import { FeeStructure, Payment } from '../models/Fees.js';
import Student from '../models/Student.js';

// ─── @desc    Get all fee structures
// ─── @route   GET /api/fees/structure
// ─── @access  Admin, Teacher
const getFeeStructures = asyncHandler(async (req, res) => {
  const structures = await FeeStructure.find({ isActive: true })
    .populate('class', 'name section grade')
    .sort({ createdAt: -1 });
  res.json({ success: true, structures });
});

// ─── @desc    Create fee structure
// ─── @route   POST /api/fees/structure
// ─── @access  Admin
const createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.create(req.body);
  res.status(201).json({ success: true, structure });
});

// ─── @desc    Get all payments
// ─── @route   GET /api/fees
// ─── @access  Admin
const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, studentId, status, month, academicYear } = req.query;
  const query = {};

  if (studentId)    query.student      = studentId;
  if (status)       query.status       = status;
  if (month)        query.month        = month;
  if (academicYear) query.academicYear = academicYear;

  const total    = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: payments.length, total, pages: Math.ceil(total / limit), payments });
});

// ─── @desc    Create payment record
// ─── @route   POST /api/fees
// ─── @access  Admin
const createPayment = asyncHandler(async (req, res) => {
  const { studentId, ...paymentData } = req.body;

  const count = await Payment.countDocuments();
  paymentData.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  paymentData.student       = studentId;
  paymentData.collectedBy   = req.user._id;
  if (paymentData.paidAmount >= paymentData.amount) paymentData.paymentDate = new Date();

  const payment = await Payment.create(paymentData);

  // Sync student fee status
  const pending = await Payment.find({ student: studentId, status: { $in: ['pending', 'overdue'] } });
  const partial = await Payment.find({ student: studentId, status: 'partial' });
  const feeStatus = pending.length > 0 ? 'pending' : partial.length > 0 ? 'partial' : 'paid';
  await Student.findByIdAndUpdate(studentId, { feeStatus });

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  res.status(201).json({ success: true, payment: populated });
});

// ─── @desc    Update payment
// ─── @route   PUT /api/fees/:id
// ─── @access  Admin, Parent, Student
const updatePayment = asyncHandler(async (req, res) => {
  const existing = await Payment.findById(req.params.id);
  if (!existing) { res.status(404); throw new Error('Payment not found'); }

  // Merge paidAmount properly when parent/student pays
  const updateData = { ...req.body };
  if (req.body.paidAmount !== undefined) {
    updateData.dueAmount = existing.amount - Number(req.body.paidAmount);
    if (updateData.dueAmount <= 0) {
      updateData.status = 'paid';
      updateData.dueAmount = 0;
      if (!req.body.paymentDate) updateData.paymentDate = new Date();
    } else if (Number(req.body.paidAmount) > 0) {
      updateData.status = 'partial';
    }
    // Generate receipt if now fully paid and no receipt yet
    if (updateData.status === 'paid' && !existing.receiptNumber) {
      const count = await Payment.countDocuments();
      updateData.receiptNumber = `RCP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
    }
  }

  const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

  // Sync student fee status
  const studentId = payment.student._id || payment.student;
  const pending = await Payment.find({ student: studentId, status: { $in: ['pending', 'overdue'] } });
  const partial = await Payment.find({ student: studentId, status: 'partial' });
  const feeStatus = pending.length > 0 ? 'pending' : partial.length > 0 ? 'partial' : 'paid';
  await Student.findByIdAndUpdate(studentId, { feeStatus });

  res.json({ success: true, payment });
});

// ─── @desc    Get student fee summary
// ─── @route   GET /api/fees/student/:studentId
// ─── @access  Admin, Student (own), Parent
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;
  const query = { student: studentId };
  if (academicYear) query.academicYear = academicYear;

  const payments = await Payment.find(query).sort({ createdAt: -1 });

  const summary = {
    totalFees:    payments.reduce((s, p) => s + p.amount, 0),
    totalPaid:    payments.reduce((s, p) => s + p.paidAmount, 0),
    totalDue:     payments.reduce((s, p) => s + (p.dueAmount || 0), 0),
    paymentCount: payments.length,
    paidCount:    payments.filter((p) => p.status === 'paid').length,
    pendingCount: payments.filter((p) => p.status === 'pending').length,
  };

  res.json({ success: true, summary, payments });
});

// ─── @desc    Get fee statistics
// ─── @route   GET /api/fees/stats
// ─── @access  Admin
const getFeeStats = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const match = academicYear ? { academicYear } : {};

  const stats = await Payment.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' }, paidAmount: { $sum: '$paidAmount' } } },
  ]);

  res.json({ success: true, stats });
});

// ─── @desc    Get all fees for a parent's children
// ─── @route   GET /api/fees/parent/children
// ─── @access  Parent
const getChildrenFees = asyncHandler(async (req, res) => {
  const Parent = (await import('../models/Parent.js')).default;

  const parent = await Parent.findOne({ user: req.user._id }).populate({
    path: 'children',
    populate: [
      { path: 'user',  select: 'name email phone profileImage' },
      { path: 'class', select: 'name section grade' },
    ],
  });

  if (!parent) { res.status(404); throw new Error('Parent profile not found'); }

  const childrenFees = await Promise.all(
    parent.children.map(async (child) => {
      const payments = await Payment.find({ student: child._id }).sort({ createdAt: -1 });

      const summary = {
        totalFees:    payments.reduce((s, p) => s + (p.amount    || 0), 0),
        totalPaid:    payments.reduce((s, p) => s + (p.paidAmount || 0), 0),
        totalDue:     payments.reduce((s, p) => s + (p.dueAmount  || 0), 0),
        pendingCount: payments.filter(p => ['pending', 'overdue', 'partial'].includes(p.status)).length,
      };

      return { child, summary, payments };
    })
  );

  res.json({ success: true, childrenFees });
});

export { getFeeStructures, createFeeStructure, getPayments, createPayment, updatePayment, getStudentFees, getFeeStats, getChildrenFees };
