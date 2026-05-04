import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaFileAlt, FaMoneyBillWave, FaBook } from 'react-icons/fa';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import usePolling from '../../hooks/usePolling';

const feeStatusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getStudent();
      setStats(data.stats);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  usePolling(fetchStats, 15000);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  const presentCount = stats?.attendanceSummary?.find(a => a._id === 'present')?.count || 0;
  const totalCount = stats?.attendanceSummary?.reduce((s, a) => s + a.count, 0) || 0;
  const attendancePct = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {stats?.student?.class?.name} - Section {stats?.student?.section}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${attendancePct}%`} icon={FaCalendarAlt} color="green" subtitle="This month" />
        <StatCard title="Results" value={stats?.recentResults?.length || 0} icon={FaFileAlt} color="blue" subtitle="Recent entries" />
        <StatCard title="Pending Fees" value={stats?.pendingFees?.length || 0} icon={FaMoneyBillWave} color="red" />
        <StatCard title="Homework Due" value={stats?.upcomingHomework?.length || 0} icon={FaBook} color="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Results</h3>
            <Link to="/dashboard/results" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          {stats?.recentResults?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentResults.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{r.subject?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{r.examType?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{r.marksObtained}/{r.maxMarks}</p>
                    <p className="text-xs text-gray-400">{r.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">No results yet</p>}
        </div>

        {/* Upcoming Homework */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Homework</h3>
            <Link to="/dashboard/homework" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          {stats?.upcomingHomework?.length > 0 ? (
            <div className="space-y-2">
              {stats.upcomingHomework.map((hw) => (
                <div key={hw._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{hw.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{hw.subject?.name}</p>
                    </div>
                    <p className="text-xs text-red-500 flex-shrink-0 ml-2">Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">No upcoming homework</p>}
        </div>

        {/* Pending Fees */}
        {stats?.pendingFees?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Pending Fees</h3>
              <Link to="/dashboard/fees" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {stats.pendingFees.map((fee) => (
                <div key={fee._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">{fee.feeType}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fee.month} {fee.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">₹{fee.dueAmount?.toLocaleString()}</p>
                    <Badge variant={feeStatusVariant[fee.status] || 'gray'}>{fee.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">This Month's Attendance</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats?.attendanceSummary?.map((a) => (
              <div key={a._id} className={`rounded-lg p-3 text-center ${
                a._id === 'present' ? 'bg-green-50 dark:bg-green-900/20' :
                a._id === 'absent' ? 'bg-red-50 dark:bg-red-900/20' :
                a._id === 'late' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{a.count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{a._id}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${attendancePct}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{attendancePct}% attendance this month</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
