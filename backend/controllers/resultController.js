import asyncHandler from 'express-async-handler';
import Result from '../models/Result.js';

// ─── @desc    Get all results
// ─── @route   GET /api/results
// ─── @access  Admin, Teacher
const getResults = asyncHandler(async (req, res) => {
  const { classId, studentId, subjectId, examType, academicYear, page = 1, limit = 20 } = req.query;
  const query = {};

  if (classId)      query.class        = classId;
  if (studentId)    query.student      = studentId;
  if (subjectId)    query.subject      = subjectId;
  if (examType)     query.examType     = examType;
  if (academicYear) query.academicYear = academicYear;

  const total   = await Result.countDocuments(query);
  const results = await Result.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ examDate: -1 });

  res.json({ success: true, count: results.length, total, results });
});

// ─── @desc    Get results for a student
// ─── @route   GET /api/results/student/:studentId
// ─── @access  Admin, Teacher, Student (own), Parent
const getStudentResults = asyncHandler(async (req, res) => {
  const { academicYear, examType } = req.query;
  const query = { student: req.params.studentId };
  if (academicYear) query.academicYear = academicYear;
  if (examType)     query.examType     = examType;

  const results = await Result.find(query)
    .populate('subject', 'name code maxMarks')
    .populate('class', 'name section')
    .sort({ examDate: -1 });

  const totalMarks = results.reduce((s, r) => s + r.marksObtained, 0);
  const maxMarks   = results.reduce((s, r) => s + r.maxMarks, 0);

  const summary = {
    totalSubjects: results.length,
    totalMarks,
    maxMarks,
    percentage: maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0,
    passed: results.filter((r) => r.marksObtained >= r.passingMarks).length,
    failed: results.filter((r) => r.marksObtained < r.passingMarks).length,
  };

  res.json({ success: true, summary, results });
});

// ─── @desc    Create result
// ─── @route   POST /api/results
// ─── @access  Admin, Teacher
const createResult = asyncHandler(async (req, res) => {
  const result = await Result.create({ ...req.body, enteredBy: req.user._id });
  const populated = await Result.findById(result._id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code');
  res.status(201).json({ success: true, result: populated });
});

// ─── @desc    Update result
// ─── @route   PUT /api/results/:id
// ─── @access  Admin, Teacher
const updateResult = asyncHandler(async (req, res) => {
  const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!result) { res.status(404); throw new Error('Result not found'); }
  res.json({ success: true, result });
});

// ─── @desc    Delete result
// ─── @route   DELETE /api/results/:id
// ─── @access  Admin
const deleteResult = asyncHandler(async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Result deleted' });
});

export { getResults, getStudentResults, createResult, updateResult, deleteResult };
