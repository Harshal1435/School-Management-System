import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    student:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class:         { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject:       { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    examType:      { type: String, enum: ['unit_test', 'midterm', 'final', 'assignment', 'practical'], required: true },
    academicYear:  { type: String, required: true },
    term:          { type: String, enum: ['term1', 'term2', 'term3', 'annual'] },
    marksObtained: { type: Number, required: true },
    maxMarks:      { type: Number, required: true },
    passingMarks:  { type: Number, default: 40 },
    grade:         { type: String },
    remarks:       { type: String },
    examDate:      { type: Date },
    enteredBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resultSchema.pre('save', function (next) {
  const pct = (this.marksObtained / this.maxMarks) * 100;
  if (pct >= 90)      this.grade = 'A+';
  else if (pct >= 80) this.grade = 'A';
  else if (pct >= 70) this.grade = 'B+';
  else if (pct >= 60) this.grade = 'B';
  else if (pct >= 50) this.grade = 'C';
  else if (pct >= 40) this.grade = 'D';
  else                this.grade = 'F';
  next();
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
