import axios from 'axios';

// In production the frontend is served by the same Express server,
// so all /api calls go to the same origin — no absolute URL needed.
// In development, Vite proxies /api → http://localhost:5000.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Students ─────────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getMyProfile: () => api.get('/students/my-profile'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ─── Teachers ─────────────────────────────────────────────────
export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  getMyProfile: () => api.get('/teachers/my-profile'),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// ─── Classes ──────────────────────────────────────────────────
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// ─── Subjects ─────────────────────────────────────────────────
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ─── Attendance ───────────────────────────────────────────────
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getSummary: (studentId, params) => api.get(`/attendance/summary/${studentId}`, { params }),
  getClassAttendance: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
};

// ─── Fees ─────────────────────────────────────────────────────
export const feesAPI = {
  getStructures: () => api.get('/fees/structure'),
  createStructure: (data) => api.post('/fees/structure', data),
  getPayments: (params) => api.get('/fees', { params }),
  createPayment: (data) => api.post('/fees', data),
  updatePayment: (id, data) => api.put(`/fees/${id}`, data),
  getStudentFees: (studentId, params) => api.get(`/fees/student/${studentId}`, { params }),
  getChildrenFees: () => api.get('/fees/parent/children'),
  getStats: (params) => api.get('/fees/stats', { params }),
};

// ─── Results ──────────────────────────────────────────────────
export const resultsAPI = {
  getAll: (params) => api.get('/results', { params }),
  getStudentResults: (studentId, params) => api.get(`/results/student/${studentId}`, { params }),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
};

// ─── Timetable ────────────────────────────────────────────────
export const timetableAPI = {
  getAll: (params) => api.get('/timetable', { params }),
  getByClass: (classId) => api.get(`/timetable/class/${classId}`),
  getByTeacher: (teacherId) => api.get(`/timetable/teacher/${teacherId}`),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
};

// ─── Announcements ────────────────────────────────────────────
export const announcementAPI = {
  getPublic: () => api.get('/announcements/public'),
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// ─── Admissions ───────────────────────────────────────────────
export const admissionAPI = {
  submit: (data) => api.post('/admissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/admissions', { params }),
  getById: (id) => api.get(`/admissions/${id}`),
  update: (id, data) => api.put(`/admissions/${id}`, data),
  checkStatus: (appNumber) => api.get(`/admissions/status/${appNumber}`),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Homework ─────────────────────────────────────────────────
export const homeworkAPI = {
  getAll: (params) => api.get('/homework', { params }),
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
  getById: (id) => api.get(`/homework/${id}`),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getTeacher: () => api.get('/dashboard/teacher'),
  getStudent: () => api.get('/dashboard/student'),
  getParent: () => api.get('/dashboard/parent'),
};

// ─── Upload ───────────────────────────────────────────────────
export const uploadAPI = {
  profileImage: (formData) => api.post('/upload/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  document: (formData) => api.post('/upload/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Contact ──────────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

// ─── Accountant ───────────────────────────────────────────────
export const accountantAPI = {
  getDashboard:      ()           => api.get('/accountant/dashboard'),
  // Fees
  getAllFees:        (params)     => api.get('/accountant/fees', { params }),
  createFee:        (data)       => api.post('/accountant/fees', data),
  updateFee:        (id, data)   => api.put(`/accountant/fees/${id}`, data),
  bulkMarkOverdue:  ()           => api.put('/accountant/fees/bulk-overdue'),
  sendReminder:     (data)       => api.post('/accountant/fees/reminder', data),
  getFeeReport:     (params)     => api.get('/accountant/fees/report', { params }),
  // Salary
  getSalaries:      (params)     => api.get('/accountant/salary', { params }),
  createSalary:     (data)       => api.post('/accountant/salary', data),
  updateSalary:     (id, data)   => api.put(`/accountant/salary/${id}`, data),
  deleteSalary:     (id)         => api.delete(`/accountant/salary/${id}`),
  generatePayroll:  (data)       => api.post('/accountant/salary/generate-payroll', data),
  getSalaryReport:  (params)     => api.get('/accountant/salary/report', { params }),
};

export default api;
