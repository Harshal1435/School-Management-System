import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId:        { type: String, unique: true, required: true },
    employeeId:       { type: String, unique: true },
    qualification:    { type: String },
    specialization:   { type: String },
    experience:       { type: Number, default: 0 },
    joiningDate:      { type: Date, default: Date.now },
    dateOfBirth:      { type: Date },
    gender:           { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup:       { type: String },
    salary:           { type: Number },
    assignedClasses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    isClassTeacher:   { type: Boolean, default: false },
    classTeacherOf:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    address:          { type: String },
    emergencyContact: { type: String },
    documents: [
      {
        name:       String,
        url:        String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
