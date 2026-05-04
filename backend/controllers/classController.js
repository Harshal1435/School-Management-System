import asyncHandler from 'express-async-handler';
import Class from '../models/Class.js';

// ─── @desc    Get all classes
// ─── @route   GET /api/classes
// ─── @access  Private
const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ isActive: true })
    .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name' } })
    .sort({ grade: 1, section: 1 });
  res.json({ success: true, classes });
});

// ─── @desc    Get single class
// ─── @route   GET /api/classes/:id
// ─── @access  Private
const getClass = asyncHandler(async (req, res) => {
  const cls = await Class.findById(req.params.id)
    .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name email' } })
    .populate('subjects', 'name code')
    .populate({ path: 'students', populate: { path: 'user', select: 'name' } });

  if (!cls) { res.status(404); throw new Error('Class not found'); }
  res.json({ success: true, class: cls });
});

// ─── @desc    Create class
// ─── @route   POST /api/classes
// ─── @access  Admin
const createClass = asyncHandler(async (req, res) => {
  const cls = await Class.create(req.body);
  res.status(201).json({ success: true, class: cls });
});

// ─── @desc    Update class
// ─── @route   PUT /api/classes/:id
// ─── @access  Admin
const updateClass = asyncHandler(async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cls) { res.status(404); throw new Error('Class not found'); }
  res.json({ success: true, class: cls });
});

// ─── @desc    Delete (deactivate) class
// ─── @route   DELETE /api/classes/:id
// ─── @access  Admin
const deleteClass = asyncHandler(async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!cls) { res.status(404); throw new Error('Class not found'); }
  res.json({ success: true, message: 'Class deactivated' });
});

export { getClasses, getClass, createClass, updateClass, deleteClass };
