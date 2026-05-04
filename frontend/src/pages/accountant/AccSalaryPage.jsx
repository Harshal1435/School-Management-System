import { useState, useCallback, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheckCircle, FaCog } from 'react-icons/fa';
import { accountantAPI } from '../../services/api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import usePolling from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const statusVariant = { paid: 'success', pending: 'warning', on_hold: 'danger' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const inputCls = 'w-full border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

/* ── Salary Form Modal ───────────────────────────────────────── */
const SalaryModal = ({ salary, users, onClose, onSuccess }) => {
  const isCreate = !salary;
  const [form, setForm] = useState(isCreate ? {
    employee: '', employeeType: 'teacher', month: '', year: new Date().getFullYear(),
    academicYear: '2024-25', basicSalary: '', allowances: '', deductions: '', bonus: '0',
    paymentMethod: 'bank_transfer', bankAccount: '', remarks: '',
  } : {
    paidAmount:    salary.netSalary,
    status:        salary.status,
    paymentMethod: salary.paymentMethod || 'bank_transfer',
    transactionId: salary.transactionId || '',
    paymentDate:   salary.paymentDate ? salary.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
    remarks:       salary.remarks || '',
  });
  const [saving, setSaving] = useState(false);

  // Auto-fill allowances/deductions when basic salary changes
  const handleBasicChange = (val) => {
    const basic = Number(val);
    setForm(f => ({
      ...f,
      basicSalary: val,
      allowances:  String(Math.round(basic * 0.2)),
      deductions:  String(Math.round(basic * 0.12)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isCreate) {
        await accountantAPI.createSalary(form);
        toast.success('Salary record created');
      } else {
        await accountantAPI.updateSalary(salary._id, form);
        toast.success('Salary updated');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const net = isCreate
    ? (Number(form.basicSalary) + Number(form.allowances || 0) + Number(form.bonus || 0)) - Number(form.deductions || 0)
    : salary.netSalary;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreate ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
              <select value={form.employee} required onChange={e => setForm({...form, employee: e.target.value})} className={inputCls}>
                <option value="">Select employee...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Employee Type</label>
              <select value={form.employeeType} onChange={e => setForm({...form, employeeType: e.target.value})} className={inputCls}>
                {['teacher','admin','accountant','staff'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Month *</label>
              <select value={form.month} required onChange={e => setForm({...form, month: e.target.value})} className={inputCls}>
                <option value="">Select...</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Year *</label>
              <input type="number" required value={form.year} onChange={e => setForm({...form, year: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Basic Salary *</label>
              <input type="number" required value={form.basicSalary} onChange={e => handleBasicChange(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Allowances (HRA etc.)</label>
              <input type="number" value={form.allowances} onChange={e => setForm({...form, allowances: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Deductions (PF etc.)</label>
              <input type="number" value={form.deductions} onChange={e => setForm({...form, deductions: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bonus</label>
              <input type="number" value={form.bonus} onChange={e => setForm({...form, bonus: e.target.value})} className={inputCls} />
            </div>
          </div>
          {/* Net salary preview */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Net Salary</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{net.toLocaleString()}</span>
          </div>
        </>
      ) : (
        <>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-sm">
            <p className="font-bold text-gray-900 dark:text-white">{salary.employee?.name}</p>
            <p className="text-gray-500 dark:text-gray-400">{salary.month} {salary.year} · Net: ₹{salary.netSalary?.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputCls}>
                {['pending','paid','on_hold'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className={inputCls}>
                {['bank_transfer','cash','cheque','online'].map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm({...form, paymentDate: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label>
              <input type="text" value={form.transactionId} onChange={e => setForm({...form, transactionId: e.target.value})} className={inputCls} />
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
          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</> : isCreate ? 'Create Record' : 'Update Salary'}
        </button>
      </div>
    </form>
  );
};

/* ── Generate Payroll Modal ──────────────────────────────────── */
const GeneratePayrollModal = ({ onClose, onSuccess }) => {
  const now = new Date();
  const [form, setForm] = useState({
    month: MONTHS[now.getMonth()],
    year: String(now.getFullYear()),
    academicYear: '2024-25',
  });
  const [saving, setSaving] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await accountantAPI.generatePayroll(form);
      toast.success(data.message);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This will auto-generate salary records for all active teachers for the selected month.
        Existing records will be skipped.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Month *</label>
          <select value={form.month} required onChange={e => setForm({...form, month: e.target.value})} className={inputCls}>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Year *</label>
          <input type="number" required value={form.year} onChange={e => setForm({...form, year: e.target.value})} className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
          <input type="text" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border-2 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? 'Generating...' : '⚡ Generate Payroll'}
        </button>
      </div>
    </form>
  );
};

/* ── Main Page ───────────────────────────────────────────────── */
const AccSalaryPage = () => {
  const [salaries, setSalaries]   = useState([]);
  const [summary, setSummary]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [modal, setModal]         = useState(null);
  const [filters, setFilters]     = useState({ search: '', status: '', month: '', year: '', employeeType: '' });

  const fetchSalaries = useCallback(async () => {
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await accountantAPI.getSalaries(params);
      setSalaries(data.salaries);
      setSummary(data.summary || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, filters]);

  usePolling(fetchSalaries, 15000);

  useEffect(() => {
    // Load all staff users for the create form
    import('../../services/api').then(({ default: api }) => {
      api.get('/auth/me').catch(() => {});
    });
    // Use the existing API
    fetch('/api/students?limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(() => {})
      .catch(() => {});
    // Load users via a simple fetch
    fetch('/api/auth/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => { if (d.users) setUsers(d.users); })
      .catch(() => {
        // Fallback: load teachers
        fetch('/api/teachers?limit=100', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then(r => r.json())
          .then(d => {
            if (d.teachers) {
              setUsers(d.teachers.map(t => ({ _id: t.user?._id, name: t.user?.name, role: 'teacher' })).filter(u => u._id));
            }
          })
          .catch(() => {});
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary record?')) return;
    try {
      await accountantAPI.deleteSalary(id);
      toast.success('Deleted');
      fetchSalaries();
    } catch { toast.error('Failed'); }
  };

  const totalPaid    = summary.find(s => s._id === 'paid')?.total    || 0;
  const totalPending = summary.find(s => s._id === 'pending')?.total || 0;

  const filterInputCls = 'border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary & Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} records · ₹{totalPaid.toLocaleString()} paid · ₹{totalPending.toLocaleString()} pending
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({ mode: 'generate' })}
            className="flex items-center gap-1.5 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700">
            <FaCog /> Generate Payroll
          </button>
          <button onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700">
            <FaPlus /> Add Record
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Records', value: total,                              color: 'bg-gray-100 dark:bg-gray-700' },
          { label: 'Paid',          value: `₹${totalPaid.toLocaleString()}`,   color: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Pending',       value: `₹${totalPending.toLocaleString()}`,color: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'On Hold',       value: summary.find(s => s._id === 'on_hold')?.count || 0, color: 'bg-red-100 dark:bg-red-900/30' },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input type="text" placeholder="Search employee..."
            value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
            className={`${filterInputCls} pl-8 w-full`} />
        </div>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className={filterInputCls}>
          <option value="">All Status</option>
          {['paid','pending','on_hold'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className={filterInputCls}>
          <option value="">All Months</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filters.employeeType} onChange={e => setFilters({...filters, employeeType: e.target.value})} className={filterInputCls}>
          <option value="">All Types</option>
          {['teacher','admin','accountant','staff'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => setFilters({ search:'', status:'', month:'', year:'', employeeType:'' })}
          className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
          Clear
        </button>
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
                  {['Employee', 'Type', 'Month/Year', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Paid On', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {salaries.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No salary records found</td></tr>
                ) : salaries.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{s.employee?.name}</p>
                      <p className="text-xs text-gray-400">{s.employee?.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">{s.employeeType}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{s.month} {s.year}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">₹{s.basicSalary?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">+₹{s.allowances?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400">-₹{s.deductions?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-900 dark:text-white">₹{s.netSalary?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[s.status] || 'gray'}>{s.status?.replace('_',' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                      {s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setModal({ mode: 'edit', salary: s })}
                          className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(s._id)}
                          className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                          <FaTrash className="text-xs" />
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

      {/* Modals */}
      <Modal
        isOpen={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Salary Record' : 'Update Salary'}
        size="md">
        {(modal?.mode === 'create' || modal?.mode === 'edit') && (
          <SalaryModal
            salary={modal.salary}
            users={users}
            onClose={() => setModal(null)}
            onSuccess={fetchSalaries}
          />
        )}
      </Modal>

      <Modal isOpen={modal?.mode === 'generate'} onClose={() => setModal(null)} title="Generate Monthly Payroll" size="sm">
        {modal?.mode === 'generate' && (
          <GeneratePayrollModal onClose={() => setModal(null)} onSuccess={fetchSalaries} />
        )}
      </Modal>
    </div>
  );
};

export default AccSalaryPage;
