import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import { feesAPI, studentAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  studentId: '', feeType: 'tuition', amount: '', paidAmount: '',
  academicYear: '2024-25', month: '', paymentMethod: 'cash',
  dueDate: '', remarks: '',
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const FeesPage = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await feesAPI.getPayments({ page, limit: 10 });
      setPayments(data.payments);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    studentAPI.getAll({ limit: 100 }).then(({ data }) => setStudents(data.students)).catch(() => {});
    feesAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await feesAPI.createPayment(form);
      toast.success('Payment recorded successfully');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchPayments();
      feesAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally { setSaving(false); }
  };

  const totalCollected = stats.find(s => s._id === 'paid')?.paidAmount || 0;
  const totalPending = stats.find(s => s._id === 'pending')?.totalAmount || 0;
  const totalOverdue = stats.find(s => s._id === 'overdue')?.totalAmount || 0;

  const pieData = stats.map(s => ({ name: s._id, value: s.count }));

  const columns = [
    {
      key: 'student', label: 'Student', render: (student) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{student?.user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{student?.studentId}</p>
        </div>
      ),
    },
    { key: 'feeType', label: 'Fee Type', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'amount', label: 'Amount', render: (v) => `₹${v?.toLocaleString()}` },
    { key: 'paidAmount', label: 'Paid', render: (v) => `₹${v?.toLocaleString()}` },
    { key: 'dueAmount', label: 'Due', render: (v) => v > 0 ? <span className="text-red-600">₹{v?.toLocaleString()}</span> : '₹0' },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} /> },
    { key: 'paymentMethod', label: 'Method', render: (v) => v ? <span className="capitalize text-xs">{v.replace('_', ' ')}</span> : '—' },
    { key: 'receiptNumber', label: 'Receipt', render: (v) => v || '—' },
    { key: 'paymentDate', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage fee payments</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} icon={FaMoneyBillWave} color="green" />
        <StatCard title="Pending Amount" value={`₹${totalPending.toLocaleString()}`} icon={FaMoneyBillWave} color="yellow" />
        <StatCard title="Overdue Amount" value={`₹${totalOverdue.toLocaleString()}`} icon={FaMoneyBillWave} color="red" />
      </div>

      {/* Chart + Table */}
      <div className="grid lg:grid-cols-4 gap-4">
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FaChartPie className="text-indigo-500" /> Fee Status
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className={pieData.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <DataTable
            columns={columns} data={payments} loading={loading}
            totalPages={totalPages} currentPage={page} onPageChange={setPage}
          />
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Record Fee Payment" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type *</label>
              <select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['tuition','transport','library','lab','sports','exam','other'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year *</label>
              <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount (₹)</label>
              <input type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="e.g. November"
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeesPage;
