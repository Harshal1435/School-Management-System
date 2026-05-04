import { useState, useCallback } from 'react';
import {
  FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave,
  FaClipboardList, FaBullhorn, FaUsers,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import usePolling from '../../hooks/usePolling';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getAdmin();
      setStats(data.stats);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  usePolling(fetchStats, 15000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Build attendance pie data
  const attendancePie = (stats?.monthlyAttendance || []).map((a) => ({
    name: a._id,
    value: a.count,
  }));

  // Build fee bar data
  const feeBar = (stats?.feesByMonth || []).map((f) => ({
    name: `${f._id.month}/${f._id.year}`,
    amount: f.total,
    count: f.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={FaUserGraduate} color="indigo" />
        <StatCard title="Total Teachers" value={stats?.totalTeachers} icon={FaChalkboardTeacher} color="blue" />
        <StatCard title="Pending Admissions" value={stats?.pendingAdmissions} icon={FaUsers} color="yellow" />
        <StatCard title="Pending Fees" value={stats?.pendingFees} icon={FaMoneyBillWave} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Revenue Collected"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={FaUsers}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fee Collection Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Fee Collection (Last 6 Months)</h3>
          {feeBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feeBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No fee data available</div>
          )}
        </div>

        {/* Attendance Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">This Month's Attendance</h3>
          {attendancePie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={attendancePie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {attendancePie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No attendance data</div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBullhorn className="text-indigo-500" /> Recent Announcements
          </h3>
        </div>
        {stats?.recentAnnouncements?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentAnnouncements.map((ann) => (
              <div key={ann._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  ann.type === 'urgent' ? 'bg-red-100 text-red-700' :
                  ann.type === 'exam' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{ann.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ann.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    By {ann.author?.name} · {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No announcements yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
