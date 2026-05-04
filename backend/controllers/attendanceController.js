import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// ─── @desc    Get attendance records
// ─── @route   GET /api/attendance
// ─── @access  Admin, Teacher
const getAttendance = asyncHandler(async (req, res) => {
  const { classId, studentId, date, startDate, endDate, page = 1, limit = 50 } = req.query;
  const query = {};

  if (classId)   query.class   = classId;
  if (studentId) query.student = studentId;

  if (date) {
    const d = new Date(date);
    query.date = {
      $gte: new Date(new Date(d).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(d).setHours(23, 59, 59, 999)),
    };
  } else if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const total      = await Attendance.countDocuments(query);
  const attendance = await Attendance.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('class', 'name section')
    .populate('subject', 'name')
    .populate('markedBy', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ date: -1 });

  res.json({ success: true, count: attendance.length, total, attendance });
});

// ─── @desc    Mark attendance (bulk)
// ─── @route   POST /api/attendance
// ─── @access  Teacher, Admin
const markAttendance = asyncHandler(async (req, res) => {
  const { classId, subjectId, date, attendanceData } = req.body;

  if (!Array.isArray(attendanceData)) {
    res.status(400);
    throw new Error('attendanceData must be an array');
  }

  const attendanceDate = new Date(date);
  const results = [];

  for (const record of attendanceData) {
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = { student: record.studentId, class: classId, date: { $gte: startOfDay, $lte: endOfDay } };
    if (subjectId) filter.subject = subjectId;

    const update = {
      student: record.studentId, class: classId, subject: subjectId,
      date: attendanceDate, status: record.status,
      markedBy: req.user._id, remarks: record.remarks,
    };

    const doc = await Attendance.findOneAndUpdate(filter, update, { upsert: true, new: true, runValidators: true });
    results.push(doc);
  }

  res.status(201).json({ success: true, count: results.length, message: 'Attendance marked successfully' });
});

// ─── @desc    Get attendance summary for a student
// ─── @route   GET /api/attendance/summary/:studentId
// ─── @access  Admin, Teacher, Student (own), Parent
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { month, year } = req.query;
  const query = { student: studentId };

  if (month && year) {
    query.date = {
      $gte: new Date(year, month - 1, 1),
      $lte: new Date(year, month, 0, 23, 59, 59),
    };
  }

  const records = await Attendance.find(query);
  const summary = {
    total:    records.length,
    present:  records.filter((r) => r.status === 'present').length,
    absent:   records.filter((r) => r.status === 'absent').length,
    late:     records.filter((r) => r.status === 'late').length,
    excused:  records.filter((r) => r.status === 'excused').length,
  };
  summary.percentage = summary.total > 0
    ? (((summary.present + summary.late) / summary.total) * 100).toFixed(2)
    : 0;

  res.json({ success: true, summary, records });
});

// ─── @desc    Get class attendance for a specific date
// ─── @route   GET /api/attendance/class/:classId
// ─── @access  Teacher, Admin
const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;

  const base = date ? new Date(date) : new Date();
  const startOfDay = new Date(base); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(base); endOfDay.setHours(23, 59, 59, 999);

  const students   = await Student.find({ class: classId, isActive: true }).populate('user', 'name profileImage');
  const attendance = await Attendance.find({ class: classId, date: { $gte: startOfDay, $lte: endOfDay } });

  const attendanceMap = {};
  attendance.forEach((a) => { attendanceMap[a.student.toString()] = a.status; });

  const classAttendance = students.map((s) => ({
    student: {
      _id: s._id, name: s.user?.name, studentId: s.studentId,
      rollNumber: s.rollNumber, profileImage: s.user?.profileImage,
    },
    status: attendanceMap[s._id.toString()] || 'not_marked',
  }));

  res.json({ success: true, date: date || new Date(), classAttendance });
});

export { getAttendance, markAttendance, getAttendanceSummary, getClassAttendance };
