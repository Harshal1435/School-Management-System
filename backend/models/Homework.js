import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    description:  { type: String, required: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dueDate:      { type: Date, required: true },
    assignedDate: { type: Date, default: Date.now },
    attachments:  [{ name: String, url: String }],
    submissions: [
      {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        submittedAt: { type: Date, default: Date.now },
        fileUrl:     String,
        remarks:     String,
        grade:       String,
        isGraded:    { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Homework = mongoose.model('Homework', homeworkSchema);
export default Homework;
