import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, unique: true },
    studentName:       { type: String, required: true },
    dateOfBirth:       { type: Date, required: true },
    gender:            { type: String, enum: ['male', 'female', 'other'], required: true },
    applyingForClass:  { type: String, required: true },
    academicYear:      { type: String, required: true },
    previousSchool:    { type: String },
    previousClass:     { type: String },
    previousMarks:     { type: Number },
    parentName:        { type: String, required: true },
    parentEmail:       { type: String, required: true },
    parentPhone:       { type: String, required: true },
    parentOccupation:  { type: String },
    address:           { type: String, required: true },
    bloodGroup:        { type: String },
    documents: [
      {
        name:       String,
        url:        String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status:       { type: String, enum: ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'], default: 'pending' },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes:  { type: String },
    interviewDate:{ type: Date },
    admissionFee: { type: Number },
    feePaid:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

admissionSchema.pre('save', async function (next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('Admission').countDocuments();
    this.applicationNumber = `ADM${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;
