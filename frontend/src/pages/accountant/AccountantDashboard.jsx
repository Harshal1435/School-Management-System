import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMoneyBillWave, FaUsers, FaExclamationTriangle, FaCheckCircle,
  FaChartBar, FaArrowUp, FaArrowDown, FaClock,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { accountantAPI } from '../../services/api';
import usePolling from '../../hooks/usePolling';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = { paid: '#10b981', pending: '#f59e0b', partial: '#3b82f6', overdue: '#ef4444' };

const StatCard = ({ title, value, sub, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-xl text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  </div>
);

const AccountantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await accountantAPI.getDashboard();
      setData(res.dashboard);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  usePolling(fetchData, 15000);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  // Build pie data from feeStats
  const pieData = (data?.feeStats || []).map(s => ({
    name: s._id, value: s.count, amount: s.paid,
  }));

  // Build bar chart data
  const barData = (data?.monthlyFeeChart || []).map(m => ({
    name: MONTHS[(m._id.month - 1)],
    collected: m.collected,
    count: m.count,
  }));

  // Salary summary
  const salaryPaid    = data?.salarySummary?.find(s => s._id === 'paid')?.total    || 0;
  const salaryPending = data?.salarySummary?.find(s => s._id === 'pending')?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accountant Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Financial overview — school fees & payroll</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/acc-fees"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Manage Fees
          </Link>
          <Link to="/dashboard/acc-salary"
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Payroll
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="This Month Collected"
          value={`₹${(data?.thisMonthCollected || 0).toLocaleString()}`}
          sub={`${data?.thisMonthCount || 0} payments`}
          icon={FaMoneyBillWave} color="bg-indigo-500" />
        <StatCard
          title="This Year Collected"
          value={`₹${(data?.thisYearCollected || 0).toLocaleString()}`}
          sub="Academic year total"
          icon={FaChartBar} color="bg-emerald-500" />
        <StatCard
          title="Pending / Due"
          value={`₹${(data?.pendingDue || 0).toLocaleString()}`}
          sub={`${data?.pendingCount || 0} students`}
          icon={FaClock} color="bg-amber-500" />
        <StatCard
          title="Overdue Fees"
          value={data?.overdueFees || 0}
          sub="Need immediate action"
          icon={FaExclamationTriangle} color="bg-red-500" />
      </div>

      {/* Salary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Salary Paid This Month"
          value={`₹${salaryPaid.toLocaleString()}`}
          sub="Staff payroll disbursed"
          icon={FaCheckCircle} color="bg-teal-500" />
        <StatCard
          title="Salary Pending This Month"
          value={`₹${salaryPending.toLocaleString()}`}
          sub="Awaiting disbursement"
          icon={FaUsers} color="bg-violet-500" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly collection bar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Monthly Fee Collection</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                <Bar dataKey="collected" fill="#4f46e5" radius={[4,4,0,0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Fee status pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Fee Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v, name, props) => [`${v} records`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Payments</h3>
          <Link to="/dashboard/acc-fees" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
        </div>
        {data?.recentPayments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  {['Student', 'Fee Type', 'Amount', 'Paid', 'Status', 'Date'].map(h => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.recentPayments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-2.5 font-medium text-gray-900 dark:text-white">{p.student?.user?.name || '—'}</td>
                    <td className="py-2.5 capitalize text-gray-600 dark:text-gray-300">{p.feeType}</td>
                    <td className="py-2.5 text-gray-700 dark:text-gray-300">₹{p.amount?.toLocaleString()}</td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">₹{p.paidAmount?.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'paid'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        p.status === 'partial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-2.5 text-gray-400 dark:text-gray-500 text-xs">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No recent payments</p>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
