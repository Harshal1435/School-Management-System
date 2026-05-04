import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId:       { type: String, unique: true, required: true },
    rollNumber:      { type: String },
    class:           { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    section:         { type: String },
    dateOfBirth:     { type: Date },
    gender:          { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup:      { type: String },
    admissionDate:   { type: Date, default: Date.now },
    admissionNumber: { type: String, unique: true },
    parentName:      { type: String },
    parentPhone:     { type: String },
    parentEmail:     { type: String },
    parent:          { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
    address:         { type: String },
    emergencyContact:{ type: String },
    documents: [
      {
        name:       String,
        url:        String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    feeStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial', 'overdue'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
