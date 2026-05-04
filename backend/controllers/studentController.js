import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

// ─── @desc    Get all students
// ─── @route   GET /api/students
// ─── @access  Admin, Teacher
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, classId, status } = req.query;
  const query = {};

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'student' }).select('_id');
    query.user = { $in: users.map((u) => u._id) };
  }
  if (classId) query.class = classId;
  if (status)  query.isActive = status === 'active';

  const total    = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('user', 'name email phone profileImage')
    .populate('class', 'name section grade')
    .populate('parent', 'parentId')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: students.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    students,
  });
});

// ─── @desc    Get single student
// ─── @route   GET /api/students/:id
// ─── @access  Admin, Teacher, Student (own), Parent (child)
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'name email phone profileImage address')
    .populate('class', 'name section grade classTeacher')
    .populate('parent');

  if (!student) { res.status(404); throw new Error('Student not found'); }
  res.json({ success: true, student });
});

// ─── @desc    Create student
// ─── @route   POST /api/students
// ─── @access  Admin
const createStudent = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, classId, section,
    dateOfBirth, gender, bloodGroup, parentName, parentPhone,
    parentEmail, address, rollNumber,
  } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const user = await User.create({ name, email, password: password || 'Student@123', role: 'student', phone });

  const count           = await Student.countDocuments();
  const studentId       = `STU${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
  const admissionNumber = `ADM${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

  const student = await Student.create({
    user: user._id, studentId, admissionNumber, rollNumber,
    class: classId, section, dateOfBirth, gender, bloodGroup,
    parentName, parentPhone, parentEmail, address,
  });

  user.studentProfile = student._id;
  await user.save({ validateBeforeSave: false });

  if (classId) {
    await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });
  }

  const populated = await Student.findById(student._id)
    .populate('user', 'name email phone')
    .populate('class', 'name section');

  res.status(201).json({ success: true, student: populated });
});

// ─── @desc    Update student
// ─── @route   PUT /api/students/:id
// ─── @access  Admin
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }

  const { name, phone, classId, ...rest } = req.body;

  if (name || phone) await User.findByIdAndUpdate(student.user, { name, phone });

  if (classId && classId !== student.class?.toString()) {
    if (student.class) await Class.findByIdAndUpdate(student.class, { $pull: { students: student._id } });
    await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });
    rest.class = classId;
  }

  const updated = await Student.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true })
    .populate('user', 'name email phone')
    .populate('class', 'name section');

  res.json({ success: true, student: updated });
});

// ─── @desc    Delete (deactivate) student
// ─── @route   DELETE /api/students/:id
// ─── @access  Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }

  student.isActive = false;
  await student.save();
  await User.findByIdAndUpdate(student.user, { isActive: false });

  res.json({ success: true, message: 'Student deactivated successfully' });
});

// ─── @desc    Get own profile
// ─── @route   GET /api/students/my-profile
// ─── @access  Student
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
    .populate('user', 'name email phone profileImage')
    .populate('class', 'name section grade')
    .populate('parent');

  if (!student) { res.status(404); throw new Error('Student profile not found'); }
  res.json({ success: true, student });
});

export { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile };
