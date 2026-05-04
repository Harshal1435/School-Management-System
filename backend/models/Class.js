import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    section:      { type: String, trim: true },
    grade:        { type: Number, required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    students:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    subjects:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    capacity:     { type: Number, default: 40 },
    room:         { type: String },
    academicYear: { type: String, default: () => new Date().getFullYear().toString() },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.virtual('fullName').get(function () {
  return `${this.name} - Section ${this.section}`;
});

const Class = mongoose.model('Class', classSchema);
export default Class;
