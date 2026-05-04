import asyncHandler from 'express-async-handler';
import Admission from '../models/Admission.js';

// ─── @desc    Submit admission application (public)
// ─── @route   POST /api/admissions
// ─── @access  Public
const submitAdmission = asyncHandler(async (req, res) => {
  const admissionData = { ...req.body };

  if (req.files?.length > 0) {
    admissionData.documents = req.files.map((f) => ({
      name: f.originalname,
      url:  `/uploads/documents/${f.filename}`,
    }));
  }

  const admission = await Admission.create(admissionData);

  res.status(201).json({
    success: true,
    message: 'Admission application submitted successfully',
    applicationNumber: admission.applicationNumber,
    admission,
  });
});

// ─── @desc    Get all admissions
// ─── @route   GET /api/admissions
// ─── @access  Admin
const getAdmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, academicYear } = req.query;
  const query = {};
  if (status)       query.status       = status;
  if (academicYear) query.academicYear = academicYear;

  const total      = await Admission.countDocuments(query);
  const admissions = await Admission.find(query)
    .populate('reviewedBy', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: admissions.length, total, pages: Math.ceil(total / limit), admissions });
});

// ─── @desc    Get single admission
// ─── @route   GET /api/admissions/:id
// ─── @access  Admin
const getAdmission = asyncHandler(async (req, res) => {
  const admission = await Admission.findById(req.params.id).populate('reviewedBy', 'name');
  if (!admission) { res.status(404); throw new Error('Admission not found'); }
  res.json({ success: true, admission });
});

// ─── @desc    Update admission status
// ─── @route   PUT /api/admissions/:id
// ─── @access  Admin
const updateAdmission = asyncHandler(async (req, res) => {
  const admission = await Admission.findByIdAndUpdate(
    req.params.id,
    { ...req.body, reviewedBy: req.user._id },
    { new: true, runValidators: true }
  );
  if (!admission) { res.status(404); throw new Error('Admission not found'); }
  res.json({ success: true, admission });
});

// ─── @desc    Check application status by number (public)
// ─── @route   GET /api/admissions/status/:applicationNumber
// ─── @access  Public
const checkAdmissionStatus = asyncHandler(async (req, res) => {
  const admission = await Admission.findOne({ applicationNumber: req.params.applicationNumber })
    .select('applicationNumber studentName status createdAt interviewDate');
  if (!admission) { res.status(404); throw new Error('Application not found'); }
  res.json({ success: true, admission });
});

export { submitAdmission, getAdmissions, getAdmission, updateAdmission, checkAdmissionStatus };
