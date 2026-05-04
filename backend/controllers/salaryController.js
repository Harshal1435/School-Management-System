import asyncHandler from 'express-async-handler';
import Salary from '../models/Salary.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';

// ─── @desc  Get all salary records
// ─── @route GET /api/salary
// ─── @access Admin, Accountant
const getSalaries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, month, year, status, employeeType, search } = req.query;
  const query = {};

  if (month)        query.month        = month;
  if (year)         query.year         = Number(year);
  if (status)       query.status       = status;
  if (employeeType) query.employeeType = employeeType;

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    query.employee = { $in: users.map(u => u._id) };
  }

  const total    = await Salary.countDocuments(query);
  const salaries = await Salary.find(query)
    .populate('employee', 'name email role profileImage')
    .populate('teacherProfile', 'teacherId employeeId')
    .populate('processedBy', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ year: -1, createdAt: -1 });

  res.json({ success: true, count: salaries.length, total, pages: Math.ceil(total / limit), salaries });
});

// ─── @desc  Get salary stats (dashboard)
// ─── @route GET /api/salary/stats
// ─── @access Admin, Accountant
const getSalaryStats = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const match = {};
  if (month) match.month = month;
  if (year)  match.year  = Number(year);

  const [stats, byType, monthly] = await Promise.all([
    Salary.aggregate([
      { $match: match },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalNet: { $sum: '$netSalary' },
      }},
    ]),
    Salary.aggregate([
      { $match: match },
      { $group: {
        _id: '$employeeType',
        count: { $sum: 1 },
        totalNet: { $sum: '$netSalary' },
      }},
    ]),
    // Last 6 months paid totals
    Salary.aggregate([
      { $match: { status: 'paid' } },
      { $group: {
        _id: { month: '$month', year: '$year' },
        total: { $sum: '$netSalary' },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
  ]);

  res.json({ success: true, stats, byType, monthly });
});

// ─── @desc  Get single salary record
// ─── @route GET /api/salary/:id
// ─── @access Admin, Accountant
const getSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id)
    .populate('employee', 'name email role phone profileImage')
    .populate('teacherProfile', 'teacherId employeeId qualification')
    .populate('processedBy', 'name');

  if (!salary) { res.status(404); throw new Error('Salary record not found'); }
  res.json({ success: true, salary });
});

// ─── @desc  Create salary record
// ─── @route POST /api/salary
// ─── @access Admin, Accountant
const createSalary = asyncHandler(async (req, res) => {
  const data = { ...req.body, processedBy: req.user._id };

  // Auto-link teacher profile if employee is a teacher
  if (data.employeeType === 'teacher' && data.employee) {
    const tp = await Teacher.findOne({ user: data.employee });
    if (tp) data.teacherProfile = tp._id;
  }

  const salary = await Salary.create(data);
  const populated = await Salary.findById(salary._id)
    .populate('employee', 'name email role')
    .populate('processedBy', 'name');

  res.status(201).json({ success: true, salary: populated });
});

// ─── @desc  Update salary (mark paid, edit amounts, etc.)
// ─── @route PUT /api/salary/:id
// ─── @access Admin, Accountant
const updateSalary = asyncHandler(async (req, res) => {
  const update = { ...req.body, processedBy: req.user._id };

  // If marking as paid, set paymentDate
  if (update.status === 'paid' && !update.paymentDate) {
    update.paymentDate = new Date();
  }

  const salary = await Salary.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('employee', 'name email role')
    .populate('processedBy', 'name');

  if (!salary) { res.status(404); throw new Error('Salary record not found'); }
  res.json({ success: true, salary });
});

// ─── @desc  Delete salary record
// ─── @route DELETE /api/salary/:id
// ─── @access Admin
const deleteSalary = asyncHandler(async (req, res) => {
  await Salary.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Salary record deleted' });
});

// ─── @desc  Bulk generate salary for all staff for a month
// ─── @route POST /api/salary/bulk-generate
// ─── @access Admin, Accountant
const bulkGenerateSalary = asyncHandler(async (req, res) => {
  const { month, year, academicYear } = req.body;
  if (!month || !year) { res.status(400); throw new Error('month and year are required'); }

  // Get all teachers
  const teachers = await Teacher.find({ isActive: true }).populate('user', 'name email');

  const created = [];
  const skipped = [];

  for (const teacher of teachers) {
    // Skip if already exists
    const exists = await Salary.findOne({ employee: teacher.user._id, month, year: Number(year) });
    if (exists) { skipped.push(teacher.user.name); continue; }

    const salary = await Salary.create({
      employee:       teacher.user._id,
      employeeType:   'teacher',
      teacherProfile: teacher._id,
      month,
      year:           Number(year),
      academicYear:   academicYear || `${year}-${String(Number(year) + 1).slice(-2)}`,
      basicSalary:    teacher.salary || 30000,
      allowances:     Math.round((teacher.salary || 30000) * 0.2),
      deductions:     Math.round((teacher.salary || 30000) * 0.1),
      status:         'pending',
      processedBy:    req.user._id,
    });
    created.push(salary);
  }

  res.status(201).json({
    success: true,
    message: `Generated ${created.length} salary records. Skipped ${skipped.length} (already exist).`,
    created: created.length,
    skipped: skipped.length,
  });
});

export { getSalaries, getSalaryStats, getSalary, createSalary, updateSalary, deleteSalary, bulkGenerateSalary };
