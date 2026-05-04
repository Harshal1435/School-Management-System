import asyncHandler from 'express-async-handler';

// ─── @desc    Upload profile image
// ─── @route   POST /api/upload/profile-image
// ─── @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ success: true, url: `/uploads/profiles/${req.file.filename}`, filename: req.file.filename });
});

// ─── @desc    Upload single document
// ─── @route   POST /api/upload/document
// ─── @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({
    success: true,
    url: `/uploads/documents/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
  });
});

// ─── @desc    Upload multiple documents
// ─── @route   POST /api/upload/documents
// ─── @access  Private
const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files?.length) { res.status(400); throw new Error('No files uploaded'); }
  const files = req.files.map((f) => ({
    url: `/uploads/documents/${f.filename}`,
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
  }));
  res.json({ success: true, files });
});

export { uploadProfileImage, uploadDocument, uploadDocuments };
