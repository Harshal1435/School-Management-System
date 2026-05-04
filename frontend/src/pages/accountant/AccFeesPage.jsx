import { useState, useCallback } from 'react';
import {
  FaPlus, FaSearch, FaEdit, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaDownload, FaBell, FaCreditCard, FaEye,
} from 'react-icons/fa';
import { accountantAPI, studentAPI, classAPI } from '../../services/api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import usePolling from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const statusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const emptyForm = {
  studentId: '', academicYear: '2024-25', month: '', feeType: 'tuition',
  amount: '', paidAmount: '0', paymentMethod: 'cash', dueDate: '', remarks: '',
};

/* ── Pay / Edit Modal ────────────────────────────────────────── */
const FeeModal = ({ fee, students, onClose, onSuccess, mode }) => {
  const isCreate = mode === 'create';
  const [form, setForm] = useState(isCreate ? emptyForm : {
    paidAmount:    fee?.paidAmount || 0,
    paymentMethod: fee?.paymentMethod || 'cash',
    transactionId: fee?.transactionId || '',
    status:        fee?.status || 'pending',
    remarks:       fee?.remarks || '',
    paymentDate:   fee?.paymentDate ? fee.paymentDate.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isCreate) {
        await accountantAPI.createFee(form);
        toast.success('Fee record created');
      } else {
        await accountantAPI.updateFee(fee._id, form);
        toast.success('Fee updated');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreate ? (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Student *</label>
            <select value={form.studentId} required onChange={e => setForm({...form, studentId: e.target.value})} className={inputCls}>
              <option value="">Select student...</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fee Type *</label>
              <select value={form.feeType} onChange={e => setForm({...form, feeType: e.target.value})} className={inputCls}>
                {['tuition','transport','library','lab','sports','exam','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <select value={form.month} onChange={e => setForm({...form, month: e.target.value})} className={inputCls}>
                <option value="">Select...</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Amount *</label>
              <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Paid Amount</label>
              <input type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
              <input type="text" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className={inputCls} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit / Pay mode */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-sm">
            <p className="font-bold text-gray-900 dark:text-white capitalize">{fee?.feeType} — {fee?.month} {fee?.academicYear}</p>
            <p className="text-gray-500 dark:text-gray-400">{fee?.student?.user?.name}</p>
            <div className="flex gap-4 mt-2">
              <span>Total: <strong>₹{fee?.amount?.toLocaleString()}</strong></span>
              <span className="text-emerald-600">Paid: <strong>₹{fee?.paidAmount?.toLocaleString()}</strong></span>
              <span className="text-red-600">Due: <strong>₹{fee?.dueAmount?.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Paid Amount</label>
              <input type="number" value={form.paidAmount} max={fee?.amount}
                onChange={e => setForm({...form, paidAmount: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputCls}>
                {['pending','partial','paid','overdue'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className={inputCls}>
                {['cash','online','cheque','bank_transfer'].map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm({...form, paymentDate: e.target.value})} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
              <input type="text" value={form.transactionId} placeholder="UTR / Reference"
                onChange={e => setForm({...form, transactionId: e.target.value})} className={inputCls} />
            </div>
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
        <textarea rows={2} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className={inputCls} />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border-2 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</> : isCreate ? 'Create Record' : 'Update Payment'}
        </button>
      </div>
    </form>
  );
};

/* ── Main Page ───────────────────────────────────────────────── */
const AccFeesPage = () => {
  const [fees, setFees]           = useState([]);
  const [summary, setSummary]     = useState({});
  const [students, setStudents]   = useState([]);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [modal, setModal]         = useState(null); // { mode: 'create'|'edit', fee? }
  const [selected, setSelected]   = useState([]); // selected IDs for bulk actions

  // Filters
  const [filters, setFilters] = useState({
    search: '', status: '', feeType: '', month: '', classId: '', academicYear: '',
  });

  const fetchFees = useCallback(async () => {
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await accountantAPI.getAllFees(params);
      setFees(data.payments);
      setSummary(data.summary);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, filters]);

  usePolling(fetchFees, 15000);

  // Load students + classes once
  useState(() => {
    studentAPI.getAll({ limit: 500 }).then(({ data }) => setStudents(data.students)).catch(() => {});
    classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
  });

  const handleBulkOverdue = async () => {
    if (!window.confirm('Mark all past-due pending fees as overdue?')) return;
    try {
      const { data } = await accountantAPI.bulkMarkOverdue();
      toast.success(data.message);
      fetchFees();
    } catch { toast.error('Failed'); }
  };

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const inputCls = 'border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} records · ₹{(summary.totalFees || 0).toLocaleString()} total · ₹{(summary.totalPaid || 0).toLocaleString()} collected · ₹{(summary.totalDue || 0).toLocaleString()} due
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleBulkOverdue}
            className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50">
            <FaExclamationTriangle className="text-xs" /> Mark Overdue
          </button>
          <button onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">
            <FaPlus /> Add Fee Record
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Fees',  value: `₹${(summary.totalFees || 0).toLocaleString()}`,  color: 'bg-gray-100 dark:bg-gray-700' },
          { label: 'Collected',   value: `₹${(summary.totalPaid || 0).toLocaleString()}`,  color: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Due',         value: `₹${(summary.totalDue  || 0).toLocaleString()}`,  color: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Records',     value: total,                                              color: 'bg-indigo-100 dark:bg-indigo-900/30' },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search student name..."
              value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
              className={`${inputCls} pl-8 w-full`} />
          </div>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className={inputCls}>
            <option value="">All Status</option>
            {['paid','pending','partial','overdue'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.feeType} onChange={e => setFilters({...filters, feeType: e.target.value})} className={inputCls}>
            <option value="">All Types</option>
            {['tuition','transport','library','lab','sports','exam','other'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className={inputCls}>
            <option value="">All Months</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filters.classId} onChange={e => setFilters({...filters, classId: e.target.value})} className={inputCls}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <button onClick={() => { setFilters({ search:'', status:'', feeType:'', month:'', classId:'', academicYear:'' }); setPage(1); }}
            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border dark:border-gray-600 rounded-xl">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  {['Student', 'Class', 'Fee Type', 'Month', 'Total', 'Paid', 'Due', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {fees.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No fee records found</td></tr>
                ) : fees.map(fee => (
                  <tr key={fee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{fee.student?.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{fee.student?.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                      {fee.student?.class?.name} {fee.student?.class?.section}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{fee.feeType}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{fee.month || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">₹{fee.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹{fee.paidAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">₹{(fee.dueAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[fee.status] || 'gray'}>{fee.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                      {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {fee.status !== 'paid' && (
                          <button onClick={() => setModal({ mode: 'edit', fee })}
                            className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                            title="Update payment">
                            <FaCreditCard className="text-xs" />
                          </button>
                        )}
                        <button onClick={() => setModal({ mode: 'edit', fee })}
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Edit">
                          <FaEdit className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Fee Record' : 'Update Payment'}
        size="md">
        {modal && (
          <FeeModal
            fee={modal.fee}
            students={students}
            mode={modal.mode}
            onClose={() => setModal(null)}
            onSuccess={fetchFees}
          />
        )}
      </Modal>
    </div>
  );
};

export default AccFeesPage;
