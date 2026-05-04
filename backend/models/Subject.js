import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    code:         { type: String, required: true, unique: true, uppercase: true },
    description:  { type: String },
    teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    classes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    creditHours:  { type: Number, default: 1 },
    type:         { type: String, enum: ['core', 'elective', 'lab', 'extracurricular'], default: 'core' },
    maxMarks:     { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
