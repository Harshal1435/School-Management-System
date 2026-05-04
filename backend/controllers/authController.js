import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';

// ─── Helper ───────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const getRoleProfile = async (user) => {
  if (user.role === 'student') {
    return Student.findOne({ user: user._id }).populate('class', 'name section grade');
  }
  if (user.role === 'teacher') {
    return Teacher.findOne({ user: user._id })
      .populate('assignedClasses', 'name section')
      .populate('assignedSubjects', 'name code');
  }
  if (user.role === 'parent') {
    return Parent.findOne({ user: user._id }).populate({
      path: 'children',
      populate: { path: 'class', select: 'name section' },
    });
  }
  return null;
};

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Your account has been deactivated. Contact admin.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const profile = await getRoleProfile(user);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      profile,
    },
  });
});

// ─── @desc    Register user
// ─── @route   POST /api/auth/register
// ─── @access  Public (initial admin) / Admin
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password, role: role || 'student', phone });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// ─── @desc    Get current user profile
// ─── @route   GET /api/auth/me
// ─── @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = await getRoleProfile(user);
  res.json({ success: true, user: { ...user.toObject(), profile } });
});

// ─── @desc    Update profile
// ─── @route   PUT /api/auth/profile
// ─── @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name    = req.body.name    || user.name;
  user.phone   = req.body.phone   || user.phone;
  user.address = req.body.address || user.address;
  if (req.body.profileImage) user.profileImage = req.body.profileImage;
  if (req.body.password)     user.password     = req.body.password;

  const updated = await user.save();

  res.json({
    success: true,
    user: {
      _id: updated._id, name: updated.name, email: updated.email,
      role: updated.role, phone: updated.phone, profileImage: updated.profileImage,
    },
  });
});

// ─── @desc    Change password
// ─── @route   PUT /api/auth/change-password
// ─── @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

export { login, register, getMe, updateProfile, changePassword };
