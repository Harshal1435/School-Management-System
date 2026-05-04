import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaEye, FaEyeSlash, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const demoAccounts = [
    { role: 'Admin',      email: 'admin@school.com',       password: 'Admin@123',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { role: 'Accountant', email: 'accountant@school.com',  password: 'Account@123', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { role: 'Teacher',    email: 'rajesh@school.com',      password: 'Teacher@123', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { role: 'Student',    email: 'student1@school.com',    password: 'Student@123', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { role: 'Parent',     email: 'parent1@school.com',     password: 'Parent@123',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaGraduationCap className="text-3xl" />
              <span className="text-2xl font-bold">EduManage</span>
            </div>
            <p className="text-indigo-200 text-sm">School Management System</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                    className="w-full border dark:border-gray-600 rounded-lg px-3 py-2.5 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Demo Accounts (click to fill)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => setForm({ email: acc.email, password: acc.password })}
                    className={`text-xs px-3 py-2 rounded-lg font-medium ${acc.color} hover:opacity-80 transition-opacity text-left`}
                  >
                    <div className="font-semibold">{acc.role}</div>
                    <div className="opacity-75 truncate">{acc.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                ← Back to School Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
