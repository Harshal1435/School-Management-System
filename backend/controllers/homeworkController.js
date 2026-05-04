import asyncHandler from 'express-async-handler';
import Homework from '../models/Homework.js';
import Teacher from '../models/Teacher.js';

// ─── @desc    Get all homework
// ─── @route   GET /api/homework
// ─── @access  Admin, Teacher
const getHomework = asyncHandler(async (req, res) => {
  const { classId, subjectId, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };
  if (classId)   query.class   = classId;
  if (subjectId) query.subject = subjectId;

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher) query.teacher = teacher._id;
  }

  const total    = await Homework.countDocuments(query);
  const homework = await Homework.find(query)
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: homework.length, total, homework });
});

// ─── @desc    Get homework for a class
// ─── @route   GET /api/homework/class/:classId
// ─── @access  Private
const getClassHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.find({ class: req.params.classId, isActive: true })
    .populate('subject', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ dueDate: 1 });

  res.json({ success: true, homework });
});

// ─── @desc    Get single homework
// ─── @route   GET /api/homework/:id
// ─── @access  Private
const getSingleHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.findById(req.params.id)
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .populate({ path: 'submissions.student', populate: { path: 'user', select: 'name' } });

  if (!homework) { res.status(404); throw new Error('Homework not found'); }
  res.json({ success: true, homework });
});

// ─── @desc    Create homework
// ─── @route   POST /api/homework
// ─── @access  Admin, Teacher
const createHomework = asyncHandler(async (req, res) => {
  let teacherId = req.body.teacher;

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    teacherId = teacher?._id;
  }

  const homework = await Homework.create({ ...req.body, teacher: teacherId });
  res.status(201).json({ success: true, homework });
});

// ─── @desc    Update homework
// ─── @route   PUT /api/homework/:id
// ─── @access  Admin, Teacher
const updateHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!homework) { res.status(404); throw new Error('Homework not found'); }
  res.json({ success: true, homework });
});

// ─── @desc    Delete (deactivate) homework
// ─── @route   DELETE /api/homework/:id
// ─── @access  Admin, Teacher
const deleteHomework = asyncHandler(async (req, res) => {
  await Homework.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Homework removed' });
});

export { getHomework, getClassHomework, getSingleHomework, createHomework, updateHomework, deleteHomework };
