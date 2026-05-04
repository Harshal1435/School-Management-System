import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feesRoutes from './routes/feesRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import accountantRoutes from './routes/accountantRoutes.js';

// ── __dirname for ES modules ──────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ─────────────────────────────────────────────────────
// backend/ lives one level below the repo root, so:
//   __dirname          = /repo/backend
//   frontendDist       = /repo/frontend/dist
const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');

// ── Connect DB ────────────────────────────────────────────────
connectDB();

const app = express();
const server = http.createServer(app);

const isProd = process.env.NODE_ENV === 'production';

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: isProd ? allowedOrigins : '*',
  credentials: true,
}));

// ── Socket.IO ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: isProd ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on('join_room', (room) => socket.join(room));
  socket.on('disconnect', () => console.log(`❌ Socket disconnected: ${socket.id}`));
});

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (!isProd) app.use(morgan('dev'));

// ── Static: uploaded files ────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Static: built React app ───────────────────────────────────
// Serve BEFORE API routes so /assets/* files are found immediately.
// This works in both dev (when you open port 5000 directly) and prod.
app.use(express.static(frontendDist));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/accountant', accountantRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'School Management API is running', timestamp: new Date() });
});

// ── SPA catch-all ─────────────────────────────────────────────
// Any request that didn't match /api/* or a static file gets
// index.html so React Router can handle client-side navigation.
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Error handling ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`🌐 Frontend served from: ${frontendDist}`);
});

export { app, io };
