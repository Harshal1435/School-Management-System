import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: [true, 'Name is required'], trim: true },
    email:          { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:       { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role:           { type: String, enum: ['admin', 'accountant', 'teacher', 'student', 'parent'], default: 'student' },
    phone:          { type: String, trim: true },
    address:        { type: String },
    profileImage:   { type: String, default: '' },
    isActive:       { type: Boolean, default: true },
    lastLogin:      { type: Date },
    studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    teacherProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    parentProfile:  { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
