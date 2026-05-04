import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaGraduationCap, FaBars, FaTimes, FaMoon, FaSun, FaBell,
  FaSignOutAlt, FaUser, FaTachometerAlt, FaUsers, FaChalkboardTeacher,
  FaCalendarAlt, FaMoneyBillWave, FaClipboardList, FaBook,
  FaBullhorn, FaFileAlt, FaCog, FaHome, FaUserGraduate,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const getNavItems = (role) => {
  const base = [{ to: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' }];

  if (role === 'accountant') return [
    ...base,
    { to: '/dashboard/acc-fees',    icon: FaMoneyBillWave,     label: 'Fee Management' },
    { to: '/dashboard/acc-salary',  icon: FaUsers,             label: 'Salary & Payroll' },
    { to: '/dashboard/students',    icon: FaUserGraduate,      label: 'Students' },
    { to: '/dashboard/teachers',    icon: FaChalkboardTeacher, label: 'Teachers' },
    { to: '/dashboard/announcements', icon: FaBullhorn,        label: 'Announcements' },
  ];

  if (role === 'admin') return [
    ...base,
    { to: '/dashboard/students',      icon: FaUserGraduate,      label: 'Students' },
    { to: '/dashboard/teachers',      icon: FaChalkboardTeacher, label: 'Teachers' },
    { to: '/dashboard/classes',       icon: FaBook,              label: 'Classes' },
    { to: '/dashboard/subjects',      icon: FaClipboardList,     label: 'Subjects' },
    { to: '/dashboard/attendance',    icon: FaCalendarAlt,       label: 'Attendance' },
    { to: '/dashboard/fees',          icon: FaMoneyBillWave,     label: 'Fees' },
    { to: '/dashboard/acc-fees',      icon: FaMoneyBillWave,     label: 'Fee Manager' },
    { to: '/dashboard/acc-salary',    icon: FaUsers,             label: 'Payroll' },
    { to: '/dashboard/results',       icon: FaFileAlt,           label: 'Results' },
    { to: '/dashboard/timetable',     icon: FaCalendarAlt,       label: 'Timetable' },
    { to: '/dashboard/announcements', icon: FaBullhorn,          label: 'Announcements' },
    { to: '/dashboard/admissions',    icon: FaUsers,             label: 'Admissions' },
    { to: '/dashboard/homework',      icon: FaBook,              label: 'Homework' },
  ];

  if (role === 'teacher') return [
    ...base,
    { to: '/dashboard/my-classes', icon: FaBook, label: 'My Classes' },
    { to: '/dashboard/attendance', icon: FaCalendarAlt, label: 'Attendance' },
    { to: '/dashboard/results', icon: FaFileAlt, label: 'Results' },
    { to: '/dashboard/homework', icon: FaBook, label: 'Homework' },
    { to: '/dashboard/timetable', icon: FaCalendarAlt, label: 'Timetable' },
    { to: '/dashboard/announcements', icon: FaBullhorn, label: 'Announcements' },
  ];

  if (role === 'student') return [
    ...base,
    { to: '/dashboard/my-profile', icon: FaUser, label: 'My Profile' },
    { to: '/dashboard/attendance', icon: FaCalendarAlt, label: 'Attendance' },
    { to: '/dashboard/results', icon: FaFileAlt, label: 'Results' },
    { to: '/dashboard/timetable', icon: FaCalendarAlt, label: 'Timetable' },
    { to: '/dashboard/fees', icon: FaMoneyBillWave, label: 'Fees' },
    { to: '/dashboard/homework', icon: FaBook, label: 'Homework' },
    { to: '/dashboard/announcements', icon: FaBullhorn, label: 'Announcements' },
  ];

  if (role === 'parent') return [
    ...base,
    { to: '/dashboard/children',   icon: FaUserGraduate,      label: 'My Children' },
    { to: '/dashboard/pay-fees',   icon: FaMoneyBillWave,     label: 'Pay Fees' },
    { to: '/dashboard/attendance', icon: FaCalendarAlt,       label: 'Attendance' },
    { to: '/dashboard/results',    icon: FaFileAlt,           label: 'Results' },
    { to: '/dashboard/announcements', icon: FaBullhorn,       label: 'Announcements' },
  ];

  return base;
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColors = {
    admin: 'bg-red-500',
    teacher: 'bg-blue-500',
    student: 'bg-green-500',
    parent: 'bg-purple-500',
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
            <FaGraduationCap className="text-xl" />
            <span>EduManage</span>
          </Link>
          <button
            className="lg:hidden text-gray-500 dark:text-gray-400"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${roleColors[user?.role] || 'bg-gray-500'}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="text-base flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t dark:border-gray-700 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaHome className="text-base" />
            <span>Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FaSignOutAlt className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden lg:block">
              {navItems.find(n => n.to === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <Link
              to="/dashboard/notifications"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <FaBell />
            </Link>

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${roleColors[user?.role] || 'bg-gray-500'}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block font-medium">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
