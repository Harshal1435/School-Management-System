import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true },
    message:       { type: String, required: true },
    type:          { type: String, enum: ['info', 'success', 'warning', 'error', 'announcement', 'fee', 'attendance', 'result'], default: 'info' },
    recipient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String, enum: ['all', 'admin', 'teacher', 'student', 'parent'] },
    sender:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead:        { type: Boolean, default: false },
    readAt:        { type: Date },
    link:          { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
