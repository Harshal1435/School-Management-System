import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import Attendance from '../models/Attendance.js';
import { Payment } from '../models/Fees.js';
import Announcement from '../models/Announcement.js';
import Admission from '../models/Admission.js';
import Result from '../models/Result.js';
import Homework from '../models/Homework.js';

// ─── @desc    Admin dashboard stats
// ─── @route   GET /api/dashboard/admin
// ─── @access  Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const startOfMonth = new Date(new Date().setDate(1));

  const [
    totalStudents, totalTeachers, totalUsers,
    pendingAdmissions, totalRevenue, pendingFees,
    recentAnnouncements, monthlyAttendance,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    Admission.countDocuments({ status: 'pending' }),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
    Payment.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
    Announcement.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5).populate('author', 'name'),
    Attendance.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const feesByMonth = await Payment.aggregate([
    { $match: { paymentDate: { $gte: sixMonthsAgo }, status: 'paid' } },
    {
      $group: {
        _id:   { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
        total: { $sum: '$paidAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents, totalTeachers, totalUsers,
      pendingAdmissions,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingFees,
      recentAnnouncements,
      monthlyAttendance,
      feesByMonth,
    },
  });
});

// ─── @desc    Teacher dashboard stats
// ─── @route   GET /api/dashboard/teacher
// ─── @access  Teacher
const getTeacherDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
    .populate('assignedClasses', 'name section')
    .populate('assignedSubjects', 'name code');

  if (!teacher) return res.json({ success: true, stats: {} });

  const today      = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [todayAttendance, pendingHomework, recentResults] = await Promise.all([
    Attendance.countDocuments({ markedBy: req.user._id, date: { $gte: startOfDay, $lte: endOfDay } }),
    Homework.countDocuments({ teacher: teacher._id, dueDate: { $gte: new Date() }, isActive: true }),
    Result.find({ enteredBy: req.user._id })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    stats: {
      assignedClasses:  teacher.assignedClasses,
      assignedSubjects: teacher.assignedSubjects,
      todayAttendance,
      pendingHomework,
      recentResults,
    },
  });
});

// ─── @desc    Student dashboard stats
// ─── @route   GET /api/dashboard/student
// ─── @access  Student
const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('class', 'name section grade');
  if (!student) return res.json({ success: true, stats: {} });

  const now          = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();

  const [attendanceSummary, recentResults, pendingFees, upcomingHomework] = await Promise.all([
    Attendance.aggregate([
      {
        $match: {
          student: student._id,
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lte: new Date(currentYear, currentMonth, 0),
          },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Result.find({ student: student._id })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .limit(5),
    Payment.find({ student: student._id, status: { $in: ['pending', 'overdue'] } }),
    Homework.find({ class: student.class, dueDate: { $gte: new Date() }, isActive: true })
      .populate('subject', 'name')
      .sort({ dueDate: 1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    stats: { student, attendanceSummary, recentResults, pendingFees, upcomingHomework },
  });
});

// ─── @desc    Parent dashboard stats
// ─── @route   GET /api/dashboard/parent
// ─── @access  Parent
const getParentDashboard = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ user: req.user._id }).populate({
    path: 'children',
    populate: [
      { path: 'user', select: 'name email profileImage' },
      { path: 'class', select: 'name section' },
    ],
  });

  if (!parent?.children?.length) return res.json({ success: true, stats: { children: [] } });

  const childrenData = await Promise.all(
    parent.children.map(async (child) => {
      const [attendance, results, fees] = await Promise.all([
        Attendance.aggregate([
          { $match: { student: child._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Result.find({ student: child._id }).populate('subject', 'name').sort({ createdAt: -1 }).limit(3),
        Payment.find({ student: child._id, status: { $in: ['pending', 'overdue'] } }),
      ]);
      return { child, attendance, results, pendingFees: fees };
    })
  );

  res.json({ success: true, stats: { childrenData } });
});

export { getAdminDashboard, getTeacherDashboard, getStudentDashboard, getParentDashboard };
