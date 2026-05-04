import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    content:        { type: String, required: true },
    type:           { type: String, enum: ['general', 'academic', 'event', 'holiday', 'exam', 'fee', 'urgent'], default: 'general' },
    targetAudience: { type: [String], enum: ['all', 'admin', 'teacher', 'student', 'parent'], default: ['all'] },
    targetClasses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    author:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished:    { type: Boolean, default: true },
    isPinned:       { type: Boolean, default: false },
    expiresAt:      { type: Date },
    attachments:    [{ name: String, url: String }],
    views:          { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
