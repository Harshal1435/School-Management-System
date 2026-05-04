import mongoose from 'mongoose';

/**
 * Salary / Payroll record for school staff (teachers + other workers)
 */
const salarySchema = new mongoose.Schema(
  {
    // Who is being paid
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeType: { type: String, enum: ['teacher', 'admin', 'accountant', 'staff'], required: true },
    teacherProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // if teacher

    // Pay period
    month: { type: String, required: true },   // e.g. "November"
    year: { type: Number, required: true },
    academicYear: { type: String, required: true },   // e.g. "2024-25"

    // Salary breakdown
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },       // HRA, TA, etc.
    deductions: { type: Number, default: 0 },       // PF, tax, etc.
    bonus: { type: Number, default: 0 },
    netSalary: { type: Number },                   // auto-calculated

    // Payment info
    status: { type: String, enum: ['pending', 'paid', 'on_hold'], default: 'pending' },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ['bank_transfer', 'cash', 'cheque', 'online'], default: 'bank_transfer' },
    transactionId: { type: String },
    bankAccount: { type: String },
    remarks: { type: String },

    // Who processed it
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-calculate net salary before save
salarySchema.pre('save', function (next) {
  this.netSalary = (this.basicSalary + this.allowances + this.bonus) - this.deductions;
  next();
});

// Prevent duplicate salary for same employee + month + year
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model('Salary', salarySchema);
export default Salary;
