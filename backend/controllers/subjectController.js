import asyncHandler from 'express-async-handler';
import Subject from '../models/Subject.js';

// ─── @desc    Get all subjects
// ─── @route   GET /api/subjects
// ─── @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ isActive: true })
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ name: 1 });
  res.json({ success: true, subjects });
});

// ─── @desc    Get single subject
// ─── @route   GET /api/subjects/:id
// ─── @access  Private
const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
    .populate('classes', 'name section');

  if (!subject) { res.status(404); throw new Error('Subject not found'); }
  res.json({ success: true, subject });
});

// ─── @desc    Create subject
// ─── @route   POST /api/subjects
// ─── @access  Admin
const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, subject });
});

// ─── @desc    Update subject
// ─── @route   PUT /api/subjects/:id
// ─── @access  Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!subject) { res.status(404); throw new Error('Subject not found'); }
  res.json({ success: true, subject });
});

// ─── @desc    Delete (deactivate) subject
// ─── @route   DELETE /api/subjects/:id
// ─── @access  Admin
const deleteSubject = asyncHandler(async (req, res) => {
  await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Subject deactivated' });
});

export { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };
