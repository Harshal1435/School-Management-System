import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaGraduationCap, FaUsers, FaBook, FaTrophy,
  FaStar, FaChevronLeft, FaChevronRight, FaPlay, FaCheckCircle,
  FaPhone, FaEnvelope, FaMapMarkerAlt,
} from 'react-icons/fa';
import { announcementAPI } from '../../services/api';

/* ── Static data ─────────────────────────────────────────── */
const stats = [
  { icon: FaUsers,          value: '2,500+', label: 'Students Enrolled',  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  { icon: FaGraduationCap,  value: '150+',   label: 'Expert Teachers',    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { icon: FaBook,           value: '50+',    label: 'Courses Offered',    color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { icon: FaTrophy,         value: '98%',    label: 'Pass Rate',          color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amberald-900/30' },
];

const programs = [
  { title: 'Primary School',    grades: 'Grade 1–5',  desc: 'Strong foundation with activity-based learning and creative exploration.',  emoji: '🌱', color: 'from-blue-500 to-cyan-500' },
  { title: 'Middle School',     grades: 'Grade 6–8',  desc: 'Comprehensive curriculum focused on critical thinking and problem solving.', emoji: '📚', color: 'from-violet-500 to-purple-500' },
  { title: 'High School',       grades: 'Grade 9–10', desc: 'Board exam preparation with expert faculty and personalised guidance.',      emoji: '🎯', color: 'from-orange-500 to-red-500' },
  { title: 'Senior Secondary',  grades: 'Grade 11–12',desc: 'Science, Commerce & Arts streams with career counselling and mentorship.',   emoji: '🚀', color: 'from-emerald-500 to-teal-500' },
];

const testimonials = [
  { name: 'Priya Sharma',    role: 'Parent of Grade 10 student',  text: 'EduManage transformed my child\'s learning. The teachers are dedicated and the ERP keeps me updated in real-time.', rating: 5, avatar: 'PS' },
  { name: 'Rahul Gupta',     role: 'Student, Grade 12',           text: 'The school\'s focus on holistic development helped me secure admission to my dream college. Forever grateful!',       rating: 5, avatar: 'RG' },
  { name: 'Dr. Anita Patel', role: 'Parent of Grade 8 student',   text: 'Excellent transparency through the parent portal. I can track attendance, results and fees from anywhere.',          rating: 5, avatar: 'AP' },
  { name: 'Vikram Nair',     role: 'Alumni, Batch 2023',          text: 'The values and skills I gained here shaped my career. Proud to be an EduManage alumnus.',                           rating: 5, avatar: 'VN' },
];

const features = [
  { icon: '🏫', title: 'Smart Classrooms',    desc: 'All rooms equipped with smart boards, projectors and high-speed Wi-Fi.' },
  { icon: '🔬', title: 'Modern Labs',         desc: 'Physics, Chemistry, Biology and Computer labs with latest equipment.' },
  { icon: '📱', title: 'Parent App',          desc: 'Real-time updates on attendance, results and fees via our ERP portal.' },
  { icon: '🏆', title: 'Sports Complex',      desc: 'Cricket ground, basketball court, swimming pool and indoor games.' },
  { icon: '📚', title: 'Digital Library',     desc: '10,000+ books plus e-library access for students and teachers.' },
  { icon: '🎭', title: '500-seat Auditorium', desc: 'State-of-the-art venue for cultural events, seminars and functions.' },
];

const avatarColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-violet-500'];

/* ── Component ───────────────────────────────────────────── */
const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    announcementAPI.getPublic()
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch(() => {});

    // Auto-rotate testimonials
    const id = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white">
        {/* decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm mb-6">
                <FaStar className="text-amber-400" />
                <span>Ranked #1 School in the Region 2024</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
                Shaping Future
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Leaders of Tomorrow
                </span>
              </h1>
              <p className="text-lg text-indigo-200 mb-8 max-w-lg leading-relaxed">
                EduManage School provides world-class education with modern facilities, experienced faculty, and a nurturing environment for holistic development.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/admissions"
                  className="inline-flex items-center gap-2 bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/30">
                  Apply for Admission <FaArrowRight />
                </Link>
                <Link to="/about"
                  className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all">
                  <FaPlay className="text-xs" /> Virtual Tour
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10">
                {stats.map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs text-indigo-300 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick access card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-5 text-center">Quick Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Student Portal', to: '/login', emoji: '🎓', desc: 'View results & attendance' },
                    { label: 'Parent Portal',  to: '/login', emoji: '👨‍👩‍👧', desc: 'Track your child' },
                    { label: 'Teacher Portal', to: '/login', emoji: '📚', desc: 'Manage classes' },
                    { label: 'Apply Now',      to: '/admissions', emoji: '📝', desc: 'Admissions open' },
                  ].map(item => (
                    <Link key={item.label} to={item.to}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all group">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors">{item.label}</div>
                      <div className="text-xs text-indigo-300 mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-400/20 border border-amber-400/30 rounded-xl text-center">
                  <p className="text-amber-300 text-sm font-semibold">🎉 Admissions Open 2025–26</p>
                  <p className="text-xs text-indigo-300 mt-0.5">Limited seats available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                    <Icon className={`text-xl ${s.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Programs ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest">What We Offer</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">Our Academic Programs</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive educational programs designed to nurture every student's potential from primary to senior secondary.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map(prog => (
              <div key={prog.title}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className={`bg-gradient-to-br ${prog.color} p-6 text-white`}>
                  <div className="text-4xl mb-2">{prog.emoji}</div>
                  <h3 className="text-lg font-bold">{prog.title}</h3>
                  <p className="text-sm opacity-90 mt-0.5">{prog.grades}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{prog.desc}</p>
                  <Link to="/academics"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-3 hover:gap-2 transition-all">
                    Learn more <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Announcements ────────────────────────────────── */}
      {announcements.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest">Stay Updated</span>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">Latest Announcements</h2>
              </div>
              <Link to="/events" className="hidden sm:flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                View all <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann._id}
                  className="border dark:border-gray-700 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ann.type === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      ann.type === 'exam'   ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      ann.type === 'event'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>{ann.type}</span>
                    {ann.isPinned && <span className="text-xs text-gray-400">📌</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{ann.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features / Facilities ────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest">World-Class Infrastructure</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">Why Choose EduManage?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">What Our Community Says</h2>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-8 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                  <FaStar key={i} className="text-amber-400 text-lg" />
                ))}
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-200 italic leading-relaxed mb-6 max-w-2xl mx-auto">
                "{testimonials[testimonialIdx].text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColors[testimonialIdx]}`}>
                  {testimonials[testimonialIdx].avatar}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-white">{testimonials[testimonialIdx].name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{testimonials[testimonialIdx].role}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-3 mt-6">
              <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors">
                <FaChevronLeft className="text-gray-600 dark:text-gray-300" />
              </button>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === testimonialIdx ? 'bg-indigo-600 w-6' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
              <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}
                className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors">
                <FaChevronRight className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Ready to Join EduManage?</h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
            Applications are open for the 2025–26 academic year. Secure your child's future today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link to="/admissions"
              className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
              Apply Now
            </Link>
            <Link to="/contact"
              className="border-2 border-white/50 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-indigo-200">
            <span className="flex items-center gap-2"><FaPhone /> +91 98765 43210</span>
            <span className="flex items-center gap-2"><FaEnvelope /> info@edumanage.school</span>
            <span className="flex items-center gap-2"><FaMapMarkerAlt /> 123 School Street, City</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
