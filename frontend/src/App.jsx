import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route guard
import ProtectedRoute from './routes/ProtectedRoute';

// ── Public Pages ──────────────────────────────────────────────
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import AcademicsPage from './pages/public/AcademicsPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import GalleryPage from './pages/public/GalleryPage';
import EventsPage from './pages/public/EventsPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';

// ── Dashboard Pages ───────────────────────────────────────────
import DashboardRouter from './pages/dashboard/DashboardRouter';
import ProfilePage from './pages/dashboard/ProfilePage';
import AttendancePage from './pages/dashboard/AttendancePage';
import FeesPage from './pages/dashboard/FeesPage';
import ResultsPage from './pages/dashboard/ResultsPage';
import TimetablePage from './pages/dashboard/TimetablePage';
import AnnouncementsPage from './pages/dashboard/AnnouncementsPage';
import HomeworkPage from './pages/dashboard/HomeworkPage';

import ParentFeesPage from './pages/parent/ParentFeesPage';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import AccFeesPage from './pages/accountant/AccFeesPage';
import AccSalaryPage from './pages/accountant/AccSalaryPage';

// ── Admin Pages ───────────────────────────────────────────────
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import ClassesPage from './pages/admin/ClassesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import AdmissionsManagePage from './pages/admin/AdmissionsManagePage';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', fontSize: '14px' },
            }}
          />
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/academics" element={<PublicLayout><AcademicsPage /></PublicLayout>} />
            <Route path="/admissions" element={<PublicLayout><AdmissionsPage /></PublicLayout>} />
            <Route path="/facilities" element={<PublicLayout><FacilitiesPage /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />

            {/* ── Protected Dashboard Routes ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardRouter />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout><ProfilePage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/attendance"
              element={
                <ProtectedRoute>
                  <DashboardLayout><AttendancePage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/fees"
              element={
                <ProtectedRoute>
                  <DashboardLayout><FeesPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/results"
              element={
                <ProtectedRoute>
                  <DashboardLayout><ResultsPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/timetable"
              element={
                <ProtectedRoute>
                  <DashboardLayout><TimetablePage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/announcements"
              element={
                <ProtectedRoute>
                  <DashboardLayout><AnnouncementsPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/homework"
              element={
                <ProtectedRoute>
                  <DashboardLayout><HomeworkPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Admin + Accountant Routes ── */}
            <Route
              path="/dashboard/students"
              element={
                <ProtectedRoute roles={['admin', 'accountant']}>
                  <DashboardLayout><StudentsPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teachers"
              element={
                <ProtectedRoute roles={['admin', 'accountant']}>
                  <DashboardLayout><TeachersPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/classes"
              element={
                <ProtectedRoute roles={['admin', 'accountant']}>
                  <DashboardLayout><ClassesPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/subjects"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><SubjectsPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admissions"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><AdmissionsManagePage /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher alias routes */}
            <Route
              path="/dashboard/my-classes"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <DashboardLayout><ClassesPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Accountant routes */}
            <Route
              path="/dashboard/acc-fees"
              element={
                <ProtectedRoute roles={['accountant', 'admin']}>
                  <DashboardLayout><AccFeesPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/acc-salary"
              element={
                <ProtectedRoute roles={['accountant', 'admin']}>
                  <DashboardLayout><AccSalaryPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Parent alias routes */}
            <Route
              path="/dashboard/children"
              element={
                <ProtectedRoute roles={['parent']}>
                  <DashboardLayout><DashboardRouter /></DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Parent dedicated fees page */}
            <Route
              path="/dashboard/pay-fees"
              element={
                <ProtectedRoute roles={['parent']}>
                  <DashboardLayout><ParentFeesPage /></DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Notifications placeholder */}
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center text-gray-400">
                      <div className="text-4xl mb-3">🔔</div>
                      <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                      <p className="text-sm mt-1">Real-time notifications via Socket.IO</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
