import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { dashboardAPI } from '../../services/api';
import Badge from '../../components/Badge';
import usePolling from '../../hooks/usePolling';

const feeStatusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };
const gradeVariant = { 'A+': 'success', A: 'success', 'B+': 'info', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

const ParentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await dashboardAPI.getParent();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitor your children's progress</p>
      </div>

      {!stats?.childrenData?.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
          <FaUserGraduate className="text-4xl mx-auto mb-3 opacity-50" />
          <p>No children linked to your account. Contact admin.</p>
        </div>
      ) : (
        stats.childrenData.map(({ child, attendance, results, pendingFees }) => {
          const presentCount = attendance?.find(a => a._id === 'present')?.count || 0;
          const totalCount = attendance?.reduce((s, a) => s + a.count, 0) || 0;
          const attendancePct = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;
          const totalDue = pendingFees?.reduce((s, f) => s + (f.dueAmount || 0), 0) || 0;

          return (
            <div key={child._id} className="space-y-4">
              {/* Child Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    {child.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{child.user?.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {child.class?.name} · Section {child.section} · Roll #{child.rollNumber}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{child.studentId}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <Badge variant={feeStatusVariant[child.feeStatus] || 'gray'}>
                      Fee: {child.feeStatus}
                    </Badge>
                    {totalDue > 0 && (
                      <Link to="/dashboard/pay-fees"
                        className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/30">
                        <FaCreditCard className="text-xs" />
                        Pay ₹{totalDue.toLocaleString()}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending fee alert banner */}
              {totalDue > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMoneyBillWave className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                        ₹{totalDue.toLocaleString()} fee payment pending
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {pendingFees?.length} fee{pendingFees?.length > 1 ? 's' : ''} due for {child.user?.name}
                      </p>
                    </div>
                  </div>
                  <Link to="/dashboard/pay-fees"
                    className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">
                    <FaCreditCard /> Pay Now
                  </Link>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-4">
                {/* Attendance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FaCalendarAlt className="text-green-500" /> Attendance
                  </h3>
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{attendancePct}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Overall attendance</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${Number(attendancePct) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${attendancePct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {attendance?.map((a) => (
                      <div key={a._id} className="flex justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                        <span className="capitalize text-gray-600 dark:text-gray-400">{a._id}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{a.count}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/dashboard/attendance" className="block text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-3">
                    View details →
                  </Link>
                </div>

                {/* Recent Results */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FaFileAlt className="text-blue-500" /> Recent Results
                  </h3>
                  {results?.length > 0 ? (
                    <div className="space-y-2">
                      {results.map((r) => (
                        <div key={r._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{r.subject?.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{r.examType?.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{r.marksObtained}/{r.maxMarks}</p>
                            <Badge variant={gradeVariant[r.grade] || 'gray'}>{r.grade}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No results yet</p>
                  )}
                  <Link to="/dashboard/results" className="block text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-3">
                    View all results →
                  </Link>
                </div>

                {/* Pending Fees */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FaMoneyBillWave className="text-red-500" /> Fee Status
                  </h3>
                  {pendingFees?.length > 0 ? (
                    <div className="space-y-2">
                      {pendingFees.map((fee) => (
                        <div key={fee._id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{fee.feeType}</p>
                              <p className="text-xs text-gray-400">{fee.month} · {fee.academicYear}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{fee.dueAmount?.toLocaleString()}</p>
                              <Badge variant={feeStatusVariant[fee.status] || 'gray'}>{fee.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">All fees paid!</p>
                    </div>
                  )}
                  <Link to="/dashboard/pay-fees" className="block text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-3">
                    View & Pay fees →
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ParentDashboard;
