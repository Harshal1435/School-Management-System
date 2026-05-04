import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema(
  {
    class:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    academicYear: { type: String, required: true },
    feeType:      { type: String, enum: ['tuition', 'transport', 'library', 'lab', 'sports', 'exam', 'other'], required: true },
    amount:       { type: Number, required: true },
    dueDate:      { type: Date },
    description:  { type: String },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const paymentSchema = new mongoose.Schema(
  {
    student:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeStructure:  { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
    academicYear:  { type: String, required: true },
    month:         { type: String },
    feeType:       { type: String, required: true },
    amount:        { type: Number, required: true },
    paidAmount:    { type: Number, default: 0 },
    dueAmount:     { type: Number },
    paymentDate:   { type: Date },
    dueDate:       { type: Date },
    status:        { type: String, enum: ['paid', 'pending', 'partial', 'overdue'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'online', 'cheque', 'bank_transfer'] },
    transactionId: { type: String },
    receiptNumber: { type: String, unique: true, sparse: true },
    remarks:       { type: String },
    collectedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  this.dueAmount = this.amount - this.paidAmount;
  if (this.dueAmount <= 0) this.status = 'paid';
  else if (this.paidAmount > 0) this.status = 'partial';
  next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const Payment = mongoose.model('Payment', paymentSchema);

export { FeeStructure, Payment };
