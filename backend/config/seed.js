/**
 * Database Seed Script — ES Modules
 * Run from the backend folder: npm run seed
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';

// Resolve .env relative to THIS file, not the cwd — works from any directory
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User         from '../models/User.js';
import Student      from '../models/Student.js';
import Teacher      from '../models/Teacher.js';
import Parent       from '../models/Parent.js';
import Class        from '../models/Class.js';
import Subject      from '../models/Subject.js';
import Announcement from '../models/Announcement.js';
import Timetable    from '../models/Timetable.js';
import Attendance   from '../models/Attendance.js';
import Result       from '../models/Result.js';
import Homework     from '../models/Homework.js';
import { FeeStructure, Payment } from '../models/Fees.js';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined — check your .env file');
  await mongoose.connect(uri);
  console.log(`✅ MongoDB Connected: ${uri}`);
};

const clearDB = async () => {
  // Explicitly delete from every model we use
  // (mongoose.connection.collections may be empty before first query)
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Parent.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Announcement.deleteMany({}),
    Timetable.deleteMany({}),
    FeeStructure.deleteMany({}),
    Payment.deleteMany({}),
    Attendance.deleteMany({}),
    Result.deleteMany({}),
    Homework.deleteMany({}),
  ]);
  console.log('🗑️  All collections cleared');
};

const seed = async () => {
  await connectDB();
  await clearDB();

  // ── Admin ──────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Super Admin', email: 'admin@school.com',
    password: 'Admin@123', role: 'admin', phone: '9876543210',
  });
  console.log('✅ Admin created: admin@school.com / Admin@123');

  // ── Accountant ─────────────────────────────────────────────
  await User.create({
    name: 'Ravi Accountant', email: 'accountant@school.com',
    password: 'Account@123', role: 'accountant', phone: '9800000001',
  });
  console.log('✅ Accountant created: accountant@school.com / Account@123');

  // ── Accountant ─────────────────────────────────────────────
  await User.create({
    name: 'Ravi Accountant', email: 'accountant@school.com',
    password: 'Account@123', role: 'accountant', phone: '9800000001',
  });
  console.log('✅ Accountant created: accountant@school.com / Account@123');

  // ── Subjects ───────────────────────────────────────────────
  const subjects = await Subject.insertMany([
    { name: 'Mathematics',    code: 'MATH101', type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'English',        code: 'ENG101',  type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'Science',        code: 'SCI101',  type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'Social Studies', code: 'SST101',  type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'Computer Sci.',  code: 'CS101',   type: 'elective',  maxMarks: 100, passingMarks: 40 },
    { name: 'Physics',        code: 'PHY101',  type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'Chemistry',      code: 'CHEM101', type: 'core',      maxMarks: 100, passingMarks: 40 },
    { name: 'Biology',        code: 'BIO101',  type: 'core',      maxMarks: 100, passingMarks: 40 },
  ]);
  console.log(`✅ ${subjects.length} subjects created`);

  // ── Teachers ───────────────────────────────────────────────
  const teacherData = [
    { name: 'Dr. Rajesh Kumar',  email: 'rajesh@school.com',  phone: '9811111111', qual: 'PhD Mathematics',  spec: 'Algebra & Calculus', exp: 10, sal: 60000 },
    { name: 'Mrs. Priya Sharma', email: 'priya@school.com',   phone: '9822222222', qual: 'M.Sc English',     spec: 'Literature',         exp: 7,  sal: 55000 },
    { name: 'Mr. Amit Singh',    email: 'amit@school.com',    phone: '9833333333', qual: 'B.Tech CS',        spec: 'Programming',        exp: 5,  sal: 50000 },
    { name: 'Ms. Sunita Patel',  email: 'sunita@school.com',  phone: '9844444444', qual: 'M.Sc Physics',     spec: 'Optics',             exp: 8,  sal: 58000 },
  ];

  const teacherUsers = await Promise.all(
    teacherData.map((t) => User.create({ name: t.name, email: t.email, password: 'Teacher@123', role: 'teacher', phone: t.phone }))
  );

  const teacherProfiles = await Promise.all(
    teacherUsers.map((u, i) =>
      Teacher.create({
        user: u._id,
        teacherId:      `TCH2024${String(i + 1).padStart(4, '0')}`,
        employeeId:     `EMP${String(i + 1).padStart(5, '0')}`,
        qualification:  teacherData[i].qual,
        specialization: teacherData[i].spec,
        experience:     teacherData[i].exp,
        salary:         teacherData[i].sal,
        gender:         ['male', 'female', 'male', 'female'][i],
        assignedSubjects: [subjects[i % subjects.length]._id],
      })
    )
  );

  await Promise.all(
    teacherUsers.map((u, i) => User.findByIdAndUpdate(u._id, { teacherProfile: teacherProfiles[i]._id }))
  );
  console.log(`✅ ${teacherProfiles.length} teachers created`);

  // ── Classes ────────────────────────────────────────────────
  const classes = await Class.insertMany([
    { name: 'Grade 9',  section: 'A', grade: 9,  classTeacher: teacherProfiles[0]._id, capacity: 40, room: '101', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
    { name: 'Grade 9',  section: 'B', grade: 9,  classTeacher: teacherProfiles[1]._id, capacity: 40, room: '102', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
    { name: 'Grade 10', section: 'A', grade: 10, classTeacher: teacherProfiles[2]._id, capacity: 40, room: '201', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
    { name: 'Grade 10', section: 'B', grade: 10, classTeacher: teacherProfiles[3]._id, capacity: 40, room: '202', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
    { name: 'Grade 11', section: 'A', grade: 11, classTeacher: teacherProfiles[0]._id, capacity: 35, room: '301', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
    { name: 'Grade 12', section: 'A', grade: 12, classTeacher: teacherProfiles[1]._id, capacity: 35, room: '401', academicYear: '2024-25', subjects: subjects.slice(0, 5).map((s) => s._id) },
  ]);
  console.log(`✅ ${classes.length} classes created`);

  await Teacher.findByIdAndUpdate(teacherProfiles[0]._id, { assignedClasses: [classes[0]._id, classes[4]._id], isClassTeacher: true, classTeacherOf: classes[0]._id });
  await Teacher.findByIdAndUpdate(teacherProfiles[1]._id, { assignedClasses: [classes[1]._id, classes[5]._id], isClassTeacher: true, classTeacherOf: classes[1]._id });

  // ── Students ───────────────────────────────────────────────
  const studentNames = [
    'Arjun Mehta', 'Priya Verma', 'Rahul Gupta', 'Sneha Joshi',
    'Vikram Nair', 'Ananya Das', 'Rohan Kapoor', 'Kavya Reddy',
    'Aditya Sharma', 'Pooja Singh',
  ];

  const studentUsers = await Promise.all(
    studentNames.map((name, i) =>
      User.create({ name, email: `student${i + 1}@school.com`, password: 'Student@123', role: 'student', phone: `985000000${i}` })
    )
  );

  const studentProfiles = await Promise.all(
    studentUsers.map((u, i) =>
      Student.create({
        user: u._id,
        studentId:       `STU2024${String(i + 1).padStart(4, '0')}`,
        admissionNumber: `ADM2024${String(i + 1).padStart(4, '0')}`,
        rollNumber:      String(i + 1),
        class:           classes[i % 4]._id,
        section:         ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'][i],
        dateOfBirth:     new Date(2008 - (i % 3), i % 12, (i % 28) + 1),
        gender:          i % 2 === 0 ? 'male' : 'female',
        bloodGroup:      ['A+', 'B+', 'O+', 'AB+', 'A-'][i % 5],
        parentName:      `Parent of ${studentNames[i]}`,
        parentPhone:     `975000000${i}`,
        parentEmail:     `parent${i + 1}@school.com`,
        address:         `${i + 1} School Lane, City`,
        feeStatus:       ['paid', 'pending', 'partial', 'paid', 'overdue'][i % 5],
      })
    )
  );

  await Promise.all(
    classes.map(async (cls, ci) => {
      const classStudents = studentProfiles.filter((_, si) => si % 4 === ci);
      await Class.findByIdAndUpdate(cls._id, { students: classStudents.map((s) => s._id) });
    })
  );
  await Promise.all(
    studentUsers.map((u, i) => User.findByIdAndUpdate(u._id, { studentProfile: studentProfiles[i]._id }))
  );
  console.log(`✅ ${studentProfiles.length} students created`);

  // ── Parents ────────────────────────────────────────────────
  const parentUsers = await Promise.all(
    studentProfiles.slice(0, 3).map((_, i) =>
      User.create({ name: `Parent ${i + 1}`, email: `parent${i + 1}@school.com`, password: 'Parent@123', role: 'parent', phone: `965000000${i}` })
    )
  );
  await Promise.all(
    parentUsers.map((u, i) =>
      Parent.create({
        user: u._id,
        parentId:   `PAR2024${String(i + 1).padStart(4, '0')}`,
        children:   [studentProfiles[i]._id],
        relation:   ['father', 'mother', 'guardian'][i],
        occupation: ['Engineer', 'Doctor', 'Business'][i],
      })
    )
  );
  console.log(`✅ ${parentUsers.length} parents created`);

  // ── Announcements ──────────────────────────────────────────
  await Announcement.insertMany([
    {
      title: '🏆 Annual Sports Day 2025 — December 15',
      content: 'We are thrilled to announce our Annual Sports Day on December 15, 2025. Events include 100m sprint, relay race, long jump, basketball, cricket and many more. All students must register with their class teacher by December 10. Parents are cordially invited.',
      type: 'event', targetAudience: ['all'], author: adminUser._id, isPinned: true,
    },
    {
      title: '📝 Mid-Term Examination Schedule Released',
      content: 'Mid-term examinations for all classes will be held from November 20–30, 2025. The detailed timetable has been shared with class teachers. Students are advised to start preparation immediately. No re-tests will be conducted.',
      type: 'exam', targetAudience: ['student', 'parent'], author: adminUser._id,
    },
    {
      title: '💰 Q3 Fee Payment — Last Date November 30',
      content: 'This is a reminder that the last date for Q3 fee payment is November 30, 2025. Parents can pay online via the parent portal or visit the school accounts office between 9AM–2PM on working days. Late payment will attract a fine of ₹500.',
      type: 'fee', targetAudience: ['parent', 'student'], author: adminUser._id,
    },
    {
      title: '📚 New Library Books — 200 Titles Added',
      content: 'The school library has received 200 new books across Science, Mathematics, Literature, History and General Knowledge. Students are encouraged to visit the library during free periods. New e-books are also available on the student portal.',
      type: 'general', targetAudience: ['all'], author: adminUser._id,
    },
    {
      title: '🎨 Inter-School Art Competition — Register Now',
      content: 'EduManage School is hosting the Regional Inter-School Art Competition on December 5, 2025. Categories: Painting, Sketch, Digital Art. Students from Grade 6–12 can participate. Register with the Art Department by November 25.',
      type: 'event', targetAudience: ['student'], author: adminUser._id,
    },
    {
      title: '🚨 URGENT: School Closed Tomorrow (Weather Alert)',
      content: 'Due to the heavy rainfall warning issued by the Meteorological Department, the school will remain closed tomorrow. Online classes will be conducted as per the regular timetable. Parents are requested to ensure student safety.',
      type: 'urgent', targetAudience: ['all'], author: adminUser._id, isPinned: true,
    },
  ]);
  console.log('✅ 6 announcements created');

  // ── Fee Structures ─────────────────────────────────────────
  await FeeStructure.insertMany(
    classes.slice(0, 3).flatMap((cls) => [
      { class: cls._id, academicYear: '2024-25', feeType: 'tuition',   amount: 15000, dueDate: new Date('2024-12-31') },
      { class: cls._id, academicYear: '2024-25', feeType: 'transport', amount: 3000,  dueDate: new Date('2024-12-31') },
      { class: cls._id, academicYear: '2024-25', feeType: 'exam',      amount: 1500,  dueDate: new Date('2024-11-30') },
    ])
  );
  console.log('✅ Fee structures created');

  // ── Payments ───────────────────────────────────────────────
  await Payment.insertMany(
    studentProfiles.slice(0, 5).map((s, i) => ({
      student:       s._id,
      academicYear:  '2024-25',
      month:         'November',
      feeType:       'tuition',
      amount:        15000,
      paidAmount:    [15000, 0, 7500, 15000, 0][i],
      paymentDate:   i % 2 === 0 ? new Date() : null,
      status:        ['paid', 'pending', 'partial', 'paid', 'overdue'][i],
      paymentMethod: ['cash', null, 'online', 'bank_transfer', null][i],
      receiptNumber: i % 2 === 0 ? `RCP2024${String(i + 1).padStart(6, '0')}` : undefined,
      collectedBy:   adminUser._id,
    }))
  );
  console.log('✅ Sample payments created');

  // ── Timetable ──────────────────────────────────────────────
  const days  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [
    { start: '08:00', end: '09:00' }, { start: '09:00', end: '10:00' },
    { start: '10:15', end: '11:15' }, { start: '11:15', end: '12:15' },
  ];
  const entries = [];
  for (const day of days.slice(0, 3)) {
    for (let si = 0; si < slots.length; si++) {
      entries.push({
        class: classes[0]._id, subject: subjects[si % subjects.length]._id,
        teacher: teacherProfiles[si % teacherProfiles.length]._id,
        dayOfWeek: day, startTime: slots[si].start, endTime: slots[si].end,
        room: '101', academicYear: '2024-25',
      });
    }
  }
  await Timetable.insertMany(entries);
  console.log(`✅ ${entries.length} timetable entries created`);

  // ── Attendance ─────────────────────────────────────────────
  const attRecords = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    for (const student of studentProfiles.slice(0, 5)) {
      attRecords.push({
        student: student._id, class: student.class, date,
        status: Math.random() > 0.2 ? 'present' : 'absent',
        markedBy: teacherUsers[0]._id,
      });
    }
  }
  await Attendance.insertMany(attRecords);
  console.log(`✅ ${attRecords.length} attendance records created`);

  // ── Results ────────────────────────────────────────────────
  const resultDocs = [];
  for (const student of studentProfiles.slice(0, 5)) {
    for (const subject of subjects.slice(0, 4)) {
      resultDocs.push({
        student: student._id, class: student.class, subject: subject._id,
        examType: 'midterm', academicYear: '2024-25', term: 'term1',
        marksObtained: Math.floor(Math.random() * 40) + 55,
        maxMarks: 100, passingMarks: 40,
        examDate: new Date('2024-11-15'), enteredBy: teacherUsers[0]._id,
      });
    }
  }
  await Result.insertMany(resultDocs);
  console.log(`✅ ${resultDocs.length} results created`);

  // ── Salary Records ─────────────────────────────────────────
  const Salary = (await import('../models/Salary.js')).default;
  const months = ['September', 'October', 'November'];
  const salaryDocs = [];
  for (const teacher of teacherProfiles) {
    for (const [mi, month] of months.entries()) {
      salaryDocs.push({
        employee:       teacherUsers[teacherProfiles.indexOf(teacher)]._id,
        employeeType:   'teacher',
        teacherProfile: teacher._id,
        month,
        year:           2024,
        academicYear:   '2024-25',
        basicSalary:    teacher.salary || 50000,
        allowances:     Math.round((teacher.salary || 50000) * 0.2),
        deductions:     Math.round((teacher.salary || 50000) * 0.12),
        status:         mi < 2 ? 'paid' : 'pending',
        paymentDate:    mi < 2 ? new Date(`2024-${mi + 10}-01`) : null,
        paymentMethod:  'bank_transfer',
        processedBy:    adminUser._id,
      });
    }
  }
  await Salary.insertMany(salaryDocs);
  console.log(`✅ ${salaryDocs.length} salary records created`);

  // ── Homework ───────────────────────────────────────────────
  await Homework.insertMany([
    {
      title: 'Chapter 5 — Quadratic Equations',
      description: 'Solve all exercises from Chapter 5 (pages 112–118). Show all working steps. Submit in the Mathematics notebook.',
      subject: subjects[0]._id, class: classes[0]._id, teacher: teacherProfiles[0]._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Essay — My Favourite Book',
      description: 'Write a 500-word essay on your favourite book. Include the author, plot summary, and why you recommend it.',
      subject: subjects[1]._id, class: classes[0]._id, teacher: teacherProfiles[1]._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Lab Report — Acid-Base Reactions',
      description: 'Write a complete lab report for the acid-base titration experiment conducted in class. Include observations, calculations and conclusions.',
      subject: subjects[2]._id, class: classes[2]._id, teacher: teacherProfiles[2]._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Python Program — Calculator',
      description: 'Write a Python program that performs addition, subtraction, multiplication and division. Handle division by zero gracefully.',
      subject: subjects[4]._id, class: classes[2]._id, teacher: teacherProfiles[2]._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('✅ 4 homework entries created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Login Credentials:');
  console.log('   Admin:       admin@school.com       / Admin@123');
  console.log('   Accountant:  accountant@school.com  / Account@123');
  console.log('   Teacher:     rajesh@school.com      / Teacher@123');
  console.log('   Student:     student1@school.com    / Student@123');
  console.log('   Parent:      parent1@school.com     / Parent@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
