import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';

// ─── @desc    Get all teachers
// ─── @route   GET /api/teachers
// ─── @access  Admin
const getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'teacher' }).select('_id');
    query.user = { $in: users.map((u) => u._id) };
  }

  const total    = await Teacher.countDocuments(query);
  const teachers = await Teacher.find(query)
    .populate('user', 'name email phone profileImage')
    .populate('assignedClasses', 'name section grade')
    .populate('assignedSubjects', 'name code')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: teachers.length, total, pages: Math.ceil(total / limit), teachers });
});

// ─── @desc    Get single teacher
// ─── @route   GET /api/teachers/:id
// ─── @access  Admin, Teacher (own)
const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email phone profileImage address')
    .populate('assignedClasses', 'name section grade')
    .populate('assignedSubjects', 'name code')
    .populate('classTeacherOf', 'name section');

  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }
  res.json({ success: true, teacher });
});

// ─── @desc    Create teacher
// ─── @route   POST /api/teachers
// ─── @access  Admin
const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, phone, qualification, specialization, experience, salary, joiningDate, gender, dateOfBirth } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const user = await User.create({ name, email, password: password || 'Teacher@123', role: 'teacher', phone });

  const count      = await Teacher.countDocuments();
  const teacherId  = `TCH${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
  const employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

  const teacher = await Teacher.create({
    user: user._id, teacherId, employeeId, qualification,
    specialization, experience, salary, joiningDate, gender, dateOfBirth,
  });

  user.teacherProfile = teacher._id;
  await user.save({ validateBeforeSave: false });

  const populated = await Teacher.findById(teacher._id).populate('user', 'name email phone');
  res.status(201).json({ success: true, teacher: populated });
});

// ─── @desc    Update teacher
// ─── @route   PUT /api/teachers/:id
// ─── @access  Admin
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }

  const { name, phone, assignedClasses, assignedSubjects, ...rest } = req.body;

  if (name || phone) await User.findByIdAndUpdate(teacher.user, { name, phone });
  if (assignedClasses)  rest.assignedClasses  = assignedClasses;
  if (assignedSubjects) rest.assignedSubjects = assignedSubjects;

  const updated = await Teacher.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true })
    .populate('user', 'name email phone')
    .populate('assignedClasses', 'name section')
    .populate('assignedSubjects', 'name code');

  res.json({ success: true, teacher: updated });
});

// ─── @desc    Delete (deactivate) teacher
// ─── @route   DELETE /api/teachers/:id
// ─── @access  Admin
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) { res.status(404); throw new Error('Teacher not found'); }

  teacher.isActive = false;
  await teacher.save();
  await User.findByIdAndUpdate(teacher.user, { isActive: false });

  res.json({ success: true, message: 'Teacher deactivated successfully' });
});

// ─── @desc    Get own profile
// ─── @route   GET /api/teachers/my-profile
// ─── @access  Teacher
const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
    .populate('user', 'name email phone profileImage')
    .populate('assignedClasses', 'name section grade')
    .populate('assignedSubjects', 'name code')
    .populate('classTeacherOf', 'name section');

  if (!teacher) { res.status(404); throw new Error('Teacher profile not found'); }
  res.json({ success: true, teacher });
});

export { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getMyProfile };
