import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId:       { type: String, unique: true, required: true },
    children:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    occupation:     { type: String },
    annualIncome:   { type: Number },
    relation:       { type: String, enum: ['father', 'mother', 'guardian'], default: 'father' },
    alternatePhone: { type: String },
    address:        { type: String },
    isActive:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Parent = mongoose.model('Parent', parentSchema);
export default Parent;
