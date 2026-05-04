import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    date:     { type: Date, required: true },
    status:   { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks:  { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate attendance per student per day per subject
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
