import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaFileAlt, FaUsers } from 'react-icons/fa';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import usePolling from '../../hooks/usePolling';

const gradeVariant = { 'A+': 'success', A: 'success', 'B+': 'info', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getTeacher();
      setStats(data.stats);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  usePolling(fetchStats, 15000);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your classes and students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Classes" value={stats?.assignedClasses?.length || 0} icon={FaBook} color="indigo" />
        <StatCard title="Assigned Subjects" value={stats?.assignedSubjects?.length || 0} icon={FaFileAlt} color="blue" />
        <StatCard title="Today's Attendance" value={stats?.todayAttendance || 0} icon={FaCalendarAlt} color="green" subtitle="records marked today" />
        <StatCard title="Active Homework" value={stats?.pendingHomework || 0} icon={FaBook} color="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FaBook className="text-indigo-500" /> My Classes</h3>
            <Link to="/dashboard/my-classes" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          {stats?.assignedClasses?.length > 0 ? (
            <div className="space-y-2">
              {stats.assignedClasses.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{cls.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Section {cls.section}</p>
                  </div>
                  <Link to={`/dashboard/attendance`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Take Attendance</Link>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">No classes assigned</p>}
        </div>

        {/* Recent Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FaFileAlt className="text-blue-500" /> Recent Results</h3>
            <Link to="/dashboard/results" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          {stats?.recentResults?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentResults.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{r.student?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.subject?.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={gradeVariant[r.grade] || 'gray'}>{r.grade}</Badge>
                    <p className="text-xs text-gray-400 mt-1">{r.marksObtained}/{r.maxMarks}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">No results entered yet</p>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/dashboard/attendance', icon: FaCalendarAlt, label: 'Mark Attendance', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
            { to: '/dashboard/results', icon: FaFileAlt, label: 'Add Results', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
            { to: '/dashboard/homework', icon: FaBook, label: 'Assign Homework', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
            { to: '/dashboard/announcements', icon: FaUsers, label: 'Announcements', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className={`${action.color} rounded-xl p-4 text-center hover:opacity-80 transition-opacity`}>
                <Icon className="text-2xl mx-auto mb-2" />
                <p className="text-xs font-medium">{action.label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
