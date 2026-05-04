import { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaMoneyBillWave, FaReceipt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { feesAPI, studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const statusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };

const emptyAdminForm = {
  studentId: '', academicYear: '2024-25', month: '', feeType: 'tuition',
  amount: '', paidAmount: '', paymentMethod: 'cash', remarks: '',
};

/* ── Parent / Student pay modal form ─────────────────────── */
const PayModal = ({ fee, onClose, onSuccess }) => {
  const [form, setForm] = useState({ payAmount: fee?.dueAmount || '', paymentMethod: 'online', transactionId: '' });
  const [saving, setSaving] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.payAmount || Number(form.payAmount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      const newPaid = (fee.paidAmount || 0) + Number(form.payAmount);
      await feesAPI.updatePayment(fee._id, {
        paidAmount: newPaid,
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        paymentDate: new Date(),
      });
      toast.success('Payment recorded successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Fee Type</p>
        <p className="font-bold text-gray-900 dark:text-white capitalize">{fee?.feeType} — {fee?.month} {fee?.academicYear}</p>
        <div className="flex gap-6 mt-2 text-sm">
          <span>Total: <strong>₹{fee?.amount?.toLocaleString()}</strong></span>
          <span>Paid: <strong className="text-green-600">₹{fee?.paidAmount?.toLocaleString()}</strong></span>
          <span>Due: <strong className="text-red-600">₹{fee?.dueAmount?.toLocaleString()}</strong></span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Pay (₹) *</label>
        <input type="number" value={form.payAmount} required max={fee?.dueAmount}
          onChange={e => setForm({ ...form, payAmount: e.target.value })}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <p className="text-xs text-gray-400 mt-1">Max payable: ₹{fee?.dueAmount?.toLocaleString()}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
        <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="online">Online Transfer</option>
          <option value="cash">Cash</option>
          <option value="cheque">Cheque</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID (optional)</label>
        <input type="text" value={form.transactionId} placeholder="UTR / Reference number"
          onChange={e => setForm({ ...form, transactionId: e.target.value })}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
          {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing...</> : <><FaCreditCard /> Pay Now</>}
        </button>
      </div>
    </form>
  );
};

/* ── Main FeesPage ────────────────────────────────────────── */
const FeesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';
  const canView = !isAdmin; // student or parent

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [payModal, setPayModal] = useState(null); // fee object to pay
  const [form, setForm] = useState(emptyAdminForm);
  const [saving, setSaving] = useState(false);
  const [myFees, setMyFees] = useState(null);
  const intervalRef = useRef(null);

  /* ── fetch helpers ──────────────────────────────────────── */
  const fetchAdminPayments = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await feesAPI.getPayments(params);
      setPayments(data.payments);
      setTotalPages(data.pages || 1);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  const fetchMyFees = useCallback(async () => {
    if (!user?.profile?._id) return;
    try {
      const { data } = await feesAPI.getStudentFees(user.profile._id);
      setMyFees(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  /* ── initial load + real-time polling every 15 s ─────────── */
  useEffect(() => {
    if (isAdmin) {
      fetchAdminPayments();
      feesAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
      studentAPI.getAll({ limit: 200 }).then(({ data }) => setStudents(data.students)).catch(() => {});
      intervalRef.current = setInterval(fetchAdminPayments, 15000);
    } else {
      fetchMyFees();
      intervalRef.current = setInterval(fetchMyFees, 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isAdmin, fetchAdminPayments, fetchMyFees]);

  /* ── admin create payment ─────────────────────────────────── */
  const handleAdminSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await feesAPI.createPayment(form);
      toast.success('Payment recorded');
      setAdminModalOpen(false);
      fetchAdminPayments();
      feesAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const totalCollected = stats.find(s => s._id === 'paid')?.paidAmount || 0;
  const totalPending   = stats.filter(s => ['pending', 'overdue'].includes(s._id)).reduce((a, s) => a + s.totalAmount, 0);

  /* ── Admin columns ────────────────────────────────────────── */
  const adminColumns = [
    { key: 'student',      label: 'Student',   render: s => s?.user?.name || '—' },
    { key: 'feeType',      label: 'Fee Type',  render: v => <span className="capitalize">{v}</span> },
    { key: 'academicYear', label: 'Year' },
    { key: 'month',        label: 'Month' },
    { key: 'amount',       label: 'Amount',    render: v => `₹${v?.toLocaleString()}` },
    { key: 'paidAmount',   label: 'Paid',      render: v => <span className="text-green-600 dark:text-green-400 font-medium">₹{v?.toLocaleString()}</span> },
    { key: 'dueAmount',    label: 'Due',       render: v => <span className="text-red-600 dark:text-red-400">₹{(v || 0).toLocaleString()}</span> },
    { key: 'status',       label: 'Status',    render: v => <Badge variant={statusVariant[v] || 'gray'}>{v}</Badge> },
    { key: 'paymentDate',  label: 'Paid On',   render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'receiptNumber',label: 'Receipt' },
  ];

  /* ══════════════════════════════════════════════════════════
     STUDENT / PARENT VIEW
  ══════════════════════════════════════════════════════════ */
  if (canView) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isParent ? 'View and pay your child\'s fees' : 'View your fee payment history'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : myFees ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Fees',  value: `₹${(myFees.summary?.totalFees || 0).toLocaleString()}`,  color: 'bg-gray-100 dark:bg-gray-700' },
                { label: 'Total Paid',  value: `₹${(myFees.summary?.totalPaid || 0).toLocaleString()}`,  color: 'bg-green-100 dark:bg-green-900/30' },
                { label: 'Total Due',   value: `₹${(myFees.summary?.totalDue || 0).toLocaleString()}`,   color: 'bg-red-100 dark:bg-red-900/30' },
                { label: 'Pending',     value: myFees.summary?.pendingCount || 0,                         color: 'bg-amber-100 dark:bg-amber-900/30' },
              ].map(item => (
                <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Fee table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      {['Fee Type', 'Month', 'Amount', 'Paid', 'Due', 'Status', 'Date', isParent ? 'Action' : ''].filter(Boolean).map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {!myFees.payments?.length ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No fee records found</td></tr>
                    ) : myFees.payments.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 capitalize font-medium text-gray-900 dark:text-white">{p.feeType}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.month || '—'}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">₹{p.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">₹{p.paidAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">₹{(p.dueAmount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge variant={statusVariant[p.status] || 'gray'}>{p.status}</Badge></td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                        </td>
                        {isParent && (
                          <td className="px-4 py-3">
                            {p.status !== 'paid' && p.dueAmount > 0 ? (
                              <button onClick={() => setPayModal(p)}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                                <FaCreditCard className="text-xs" /> Pay ₹{p.dueAmount?.toLocaleString()}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                <FaCheckCircle /> Paid
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
            No fee records found
          </div>
        )}

        {/* Pay Modal */}
        <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Pay Fee" size="sm">
          {payModal && (
            <PayModal fee={payModal} onClose={() => setPayModal(null)} onSuccess={fetchMyFees} />
          )}
        </Modal>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     ADMIN VIEW
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage all fee payments</p>
        </div>
        <button onClick={() => { setForm(emptyAdminForm); setAdminModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Collected"  value={`₹${totalCollected.toLocaleString()}`} icon={FaMoneyBillWave} color="green" />
        <StatCard title="Total Pending"    value={`₹${totalPending.toLocaleString()}`}   icon={FaMoneyBillWave} color="red" />
        <StatCard title="Total Records"    value={payments.length}                        icon={FaReceipt}       color="indigo" />
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          {['paid', 'pending', 'partial', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={adminColumns} data={payments} loading={loading} emptyMessage="No payment records found" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Admin create payment modal */}
      <Modal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Record Payment" size="md">
        <form onSubmit={handleAdminSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
            <select value={form.studentId} required onChange={e => setForm({ ...form, studentId: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'academicYear', label: 'Academic Year' },
              { name: 'month',        label: 'Month' },
              { name: 'amount',       label: 'Total Amount', type: 'number', required: true },
              { name: 'paidAmount',   label: 'Paid Amount',  type: 'number' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input type={f.type || 'text'} value={form[f.name]} required={f.required}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
              <select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['tuition', 'transport', 'library', 'lab', 'sports', 'exam', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['cash', 'online', 'cheque', 'bank_transfer'].map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea value={form.remarks} rows={2} onChange={e => setForm({ ...form, remarks: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAdminModalOpen(false)}
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
