import asyncHandler from 'express-async-handler';
import Timetable from '../models/Timetable.js';

// ─── @desc    Get all timetable entries
// ─── @route   GET /api/timetable
// ─── @access  Admin
const getTimetable = asyncHandler(async (req, res) => {
  const { classId, teacherId, academicYear } = req.query;
  const query = { isActive: true };
  if (classId)      query.class        = classId;
  if (teacherId)    query.teacher      = teacherId;
  if (academicYear) query.academicYear = academicYear;

  const timetable = await Timetable.find(query)
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json({ success: true, timetable });
});

// ─── @desc    Get timetable for a class
// ─── @route   GET /api/timetable/class/:classId
// ─── @access  Private
const getClassTimetable = asyncHandler(async (req, res) => {
  const timetable = await Timetable.find({ class: req.params.classId, isActive: true })
    .populate('subject', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json({ success: true, timetable });
});

// ─── @desc    Get timetable for a teacher
// ─── @route   GET /api/timetable/teacher/:teacherId
// ─── @access  Private
const getTeacherTimetable = asyncHandler(async (req, res) => {
  const timetable = await Timetable.find({ teacher: req.params.teacherId, isActive: true })
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json({ success: true, timetable });
});

// ─── @desc    Create timetable entry
// ─── @route   POST /api/timetable
// ─── @access  Admin
const createTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.create(req.body);
  const populated = await Timetable.findById(entry._id)
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });

  res.status(201).json({ success: true, entry: populated });
});

// ─── @desc    Update timetable entry
// ─── @route   PUT /api/timetable/:id
// ─── @access  Admin
const updateTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!entry) { res.status(404); throw new Error('Timetable entry not found'); }
  res.json({ success: true, entry });
});

// ─── @desc    Delete timetable entry
// ─── @route   DELETE /api/timetable/:id
// ─── @access  Admin
const deleteTimetableEntry = asyncHandler(async (req, res) => {
  await Timetable.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Timetable entry removed' });
});

export {
  getTimetable, getClassTimetable, getTeacherTimetable,
  createTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
};
