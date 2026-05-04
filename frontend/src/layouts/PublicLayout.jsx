import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaGraduationCap, FaMoon, FaSun, FaPhone } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/',           label: 'Home' },
  { to: '/about',      label: 'About' },
  { to: '/academics',  label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/gallery',    label: 'Gallery' },
  { to: '/events',     label: 'Events' },
  { to: '/contact',    label: 'Contact' },
];

const PublicLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="hidden lg:block bg-indigo-700 text-indigo-100 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="flex items-center gap-2"><FaPhone className="text-xs" /> +91 98765 43210 &nbsp;|&nbsp; info@edumanage.school</span>
          <span>📅 Mon–Sat: 8AM – 5PM &nbsp;|&nbsp; 🎉 Admissions Open 2025–26</span>
        </div>
      </div>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-sm" />
              </div>
              <span>EduManage</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle — always visible */}
              <button onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode">
                {darkMode
                  ? <FaSun className="text-amber-400 text-base" />
                  : <FaMoon className="text-gray-500 text-base" />}
              </button>

              {isAuthenticated ? (
                <Link to="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Login
                </Link>
              )}

              {/* Mobile hamburger */}
              <button className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page content ────────────────────────────────── */}
      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-extrabold text-xl mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-sm" />
                </div>
                EduManage
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering education through technology. Building tomorrow's leaders today.
              </p>
              <div className="flex gap-3 mt-4">
                {['📘', '🐦', '📸', '▶️'].map((icon, i) => (
                  <button key={i} className="w-8 h-8 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-sm transition-colors">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {navLinks.slice(0, 4).map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-gray-400 hover:text-indigo-400 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">More Pages</h4>
              <ul className="space-y-2.5 text-sm">
                {navLinks.slice(4).map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-gray-400 hover:text-indigo-400 transition-colors">{l.label}</Link>
                  </li>
                ))}
                <li><Link to="/login" className="text-gray-400 hover:text-indigo-400 transition-colors">ERP Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">📍 <span>123 School Street, Education District, City – 400001</span></li>
                <li className="flex items-center gap-2">📞 <span>+91 98765 43210</span></li>
                <li className="flex items-center gap-2">✉️ <span>info@edumanage.school</span></li>
                <li className="flex items-center gap-2">🕐 <span>Mon–Sat: 8AM – 5PM</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} EduManage School. All rights reserved.</span>
            <span>Made with ❤️ for better education</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
