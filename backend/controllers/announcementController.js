import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';

// ─── @desc    Get public announcements (no auth)
// ─── @route   GET /api/announcements/public
// ─── @access  Public
const getPublicAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({
    isPublished: true,
    targetAudience: { $in: ['all'] },
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  })
    .populate('author', 'name')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(10);

  res.json({ success: true, announcements });
});

// ─── @desc    Get all announcements (role-filtered)
// ─── @route   GET /api/announcements
// ─── @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const query = { isPublished: true };

  if (req.user.role !== 'admin') {
    query.targetAudience = { $in: ['all', req.user.role] };
  }
  if (type) query.type = type;

  const total         = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('author', 'name role')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ isPinned: -1, createdAt: -1 });

  res.json({ success: true, count: announcements.length, total, announcements });
});

// ─── @desc    Get single announcement
// ─── @route   GET /api/announcements/:id
// ─── @access  Private
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name role');

  if (!announcement) { res.status(404); throw new Error('Announcement not found'); }
  res.json({ success: true, announcement });
});

// ─── @desc    Create announcement
// ─── @route   POST /api/announcements
// ─── @access  Admin, Teacher
const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, announcement });
});

// ─── @desc    Update announcement
// ─── @route   PUT /api/announcements/:id
// ─── @access  Admin, Teacher
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!announcement) { res.status(404); throw new Error('Announcement not found'); }
  res.json({ success: true, announcement });
});

// ─── @desc    Delete announcement
// ─── @route   DELETE /api/announcements/:id
// ─── @access  Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted' });
});

export {
  getPublicAnnouncements, getAnnouncements, getAnnouncement,
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
};
