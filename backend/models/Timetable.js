import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    class:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dayOfWeek:    { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    startTime:    { type: String, required: true },
    endTime:      { type: String, required: true },
    room:         { type: String },
    academicYear: { type: String, default: () => new Date().getFullYear().toString() },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
