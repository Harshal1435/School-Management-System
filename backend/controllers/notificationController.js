import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// ─── @desc    Get user notifications
// ─── @route   GET /api/notifications
// ─── @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const query = {
    $or: [
      { recipient: req.user._id },
      { recipientRole: 'all' },
      { recipientRole: req.user.role },
    ],
  };
  if (unread === 'true') query.isRead = false;

  const total        = await Notification.countDocuments(query);
  const unreadCount  = await Notification.countDocuments({ ...query, isRead: false });
  const notifications = await Notification.find(query)
    .populate('sender', 'name role')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: notifications.length, total, unreadCount, notifications });
});

// ─── @desc    Mark notification as read
// ─── @route   PUT /api/notifications/:id/read
// ─── @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  res.json({ success: true, notification });
});

// ─── @desc    Mark all notifications as read
// ─── @route   PUT /api/notifications/mark-all-read
// ─── @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ─── @desc    Send notification
// ─── @route   POST /api/notifications
// ─── @access  Admin, Teacher
const sendNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({ ...req.body, sender: req.user._id });

  const io = req.app.get('io');
  if (io) {
    if (notification.recipientRole) {
      io.to(notification.recipientRole).emit('new_notification', notification);
    } else if (notification.recipient) {
      io.to(notification.recipient.toString()).emit('new_notification', notification);
    }
  }

  res.status(201).json({ success: true, notification });
});

// ─── @desc    Delete notification
// ─── @route   DELETE /api/notifications/:id
// ─── @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});

export { getNotifications, markAsRead, markAllRead, sendNotification, deleteNotification };
