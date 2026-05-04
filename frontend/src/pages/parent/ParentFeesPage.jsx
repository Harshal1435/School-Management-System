import { useState, useCallback } from 'react';
import {
  FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaExclamationTriangle,
  FaReceipt, FaUserGraduate, FaSpinner, FaHistory,
} from 'react-icons/fa';
import { feesAPI } from '../../services/api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import usePolling from '../../hooks/usePolling';
import toast from 'react-hot-toast';

/* ── helpers ─────────────────────────────────────────────── */
const statusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };
const statusIcon = {
  paid:    <FaCheckCircle className="text-green-500" />,
  pending: <FaExclamationTriangle className="text-amber-500" />,
  partial: <FaExclamationTriangle className="text-blue-500" />,
  overdue: <FaExclamationTriangle className="text-red-500" />,
};

/* ── Pay Modal ───────────────────────────────────────────── */
const PayModal = ({ fee, childName, onClose, onSuccess }) => {
  const [payAmount, setPayAmount]       = useState(String(fee.dueAmount || ''));
  const [method, setMethod]             = useState('online');
  const [transactionId, setTransactionId] = useState('');
  const [saving, setSaving]             = useState(false);
  const [done, setDone]                 = useState(false);
  const [receipt, setReceipt]           = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0)          return toast.error('Enter a valid amount');
    if (amt > fee.dueAmount)       return toast.error(`Max payable is ₹${fee.dueAmount.toLocaleString()}`);

    setSaving(true);
    try {
      const newPaid = (fee.paidAmount || 0) + amt;
      const { data } = await feesAPI.updatePayment(fee._id, {
        paidAmount: newPaid,
        paymentMethod: method,
        transactionId: transactionId || undefined,
        paymentDate: new Date(),
      });
      setReceipt(data.payment);
      setDone(true);
      toast.success('Payment successful! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Success screen ─────────────────────────────────────── */
  if (done && receipt) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ₹{Number(payAmount).toLocaleString()} paid for {childName}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Fee Type</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{receipt.feeType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
            <span className="font-bold text-green-600 dark:text-green-400">₹{Number(payAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Method</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{method.replace('_', ' ')}</span>
          </div>
          {receipt.receiptNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Receipt No.</span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{receipt.receiptNumber}</span>
            </div>
          )}
          {transactionId && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
              <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{transactionId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <Badge variant={statusVariant[receipt.status] || 'gray'}>{receipt.status}</Badge>
          </div>
          {receipt.dueAmount > 0 && (
            <div className="flex justify-between border-t dark:border-gray-600 pt-2 mt-2">
              <span className="text-gray-500 dark:text-gray-400">Remaining Due</span>
              <span className="font-bold text-red-600 dark:text-red-400">₹{receipt.dueAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Done
        </button>
      </div>
    );
  }

  /* ── Payment form ───────────────────────────────────────── */
  return (
    <form onSubmit={handlePay} className="space-y-4">
      {/* Fee summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900 dark:text-white capitalize text-base">{fee.feeType} Fee</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{fee.month} · {fee.academicYear} · {childName}</p>
          </div>
          <Badge variant={statusVariant[fee.status] || 'gray'}>{fee.status}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">₹{fee.amount?.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">Paid</p>
            <p className="font-bold text-green-600 dark:text-green-400 text-sm">₹{(fee.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">Due</p>
            <p className="font-bold text-red-600 dark:text-red-400 text-sm">₹{(fee.dueAmount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Amount to Pay (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
          <input type="number" value={payAmount} required min="1" max={fee.dueAmount}
            onChange={e => setPayAmount(e.target.value)}
            className="w-full pl-7 pr-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-lg" />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => setPayAmount(String(fee.dueAmount))}
            className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
            Pay Full ₹{fee.dueAmount?.toLocaleString()}
          </button>
          {fee.dueAmount > 1000 && (
            <button type="button" onClick={() => setPayAmount(String(Math.floor(fee.dueAmount / 2)))}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Pay Half
            </button>
          )}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Payment Method</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'online',        label: 'Online Transfer', icon: '💳' },
            { value: 'bank_transfer', label: 'Bank Transfer',   icon: '🏦' },
            { value: 'cash',          label: 'Cash',            icon: '💵' },
            { value: 'cheque',        label: 'Cheque',          icon: '📄' },
          ].map(m => (
            <button key={m.value} type="button" onClick={() => setMethod(m.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                method === m.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction ID */}
      {(method === 'online' || method === 'bank_transfer') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Transaction / UTR ID <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" value={transactionId} placeholder="e.g. UTR123456789"
            onChange={e => setTransactionId(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 text-sm border-2 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 text-sm bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/30">
          {saving
            ? <><FaSpinner className="animate-spin" /> Processing...</>
            : <><FaCreditCard /> Pay ₹{Number(payAmount || 0).toLocaleString()}</>}
        </button>
      </div>
    </form>
  );
};

/* ══════════════════════════════════════════════════════════
   Main ParentFeesPage
══════════════════════════════════════════════════════════ */
const ParentFeesPage = () => {
  const [childrenFees, setChildrenFees] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [payModal, setPayModal]         = useState(null); // { fee, childName }
  const [activeChild, setActiveChild]   = useState(0);

  const fetchFees = useCallback(async () => {
    try {
      const { data } = await feesAPI.getChildrenFees();
      setChildrenFees(data.childrenFees || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  usePolling(fetchFees, 15000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!childrenFees.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <FaUserGraduate className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No children linked to your account.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please contact the school admin.</p>
      </div>
    );
  }

  const current     = childrenFees[activeChild] ?? {};
  const child       = current.child    ?? {};
  const summary     = current.summary  ?? { totalFees: 0, totalPaid: 0, totalDue: 0, pendingCount: 0 };
  const payments    = current.payments ?? [];
  const pendingFees = payments.filter(p => p.status !== 'paid' && (p.dueAmount ?? 0) > 0);
  const paidFees    = payments.filter(p => p.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Payment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View and pay your children's school fees</p>
      </div>

      {/* Child tabs (if multiple children) */}
      {childrenFees.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {childrenFees.map((cf, i) => (
            <button key={cf.child?._id ?? i} onClick={() => setActiveChild(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeChild === i
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeChild === i ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
              }`}>
                {cf.child?.user?.name?.charAt(0) ?? '?'}
              </div>
              {cf.child?.user?.name?.split(' ')[0] ?? 'Child'}
              {(cf.summary?.pendingCount ?? 0) > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeChild === i ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {cf.summary.pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Child info + summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {child.user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{child.user?.name ?? 'Student'}</h2>
              <p className="text-indigo-200 text-sm">
                {child.class?.name ?? '—'} · Section {child.section ?? '—'} · Roll #{child.rollNumber ?? '—'}
              </p>
              <p className="text-indigo-300 text-xs mt-0.5">{child.studentId ?? ''}</p>
            </div>
            {summary.pendingCount > 0 ? (
              <div className="text-right">
                <p className="text-2xl font-extrabold">₹{(summary.totalDue ?? 0).toLocaleString()}</p>
                <p className="text-indigo-200 text-xs">Total Due</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-3 py-2">
                <FaCheckCircle className="text-green-300" />
                <span className="text-green-200 text-sm font-semibold">All Paid!</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 divide-x dark:divide-gray-700 border-t dark:border-gray-700">
          {[
            { label: 'Total Fees', value: `₹${(summary.totalFees ?? 0).toLocaleString()}`, color: 'text-gray-900 dark:text-white' },
            { label: 'Paid',       value: `₹${(summary.totalPaid ?? 0).toLocaleString()}`, color: 'text-green-600 dark:text-green-400' },
            { label: 'Due',        value: `₹${(summary.totalDue  ?? 0).toLocaleString()}`, color: 'text-red-600 dark:text-red-400' },
            { label: 'Pending',    value: summary.pendingCount ?? 0,                        color: 'text-amber-600 dark:text-amber-400' },
          ].map(item => (
            <div key={item.label} className="p-4 text-center">
              <p className={`text-xl font-extrabold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending / Due fees */}
      {pendingFees.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" />
            Pending Payments ({pendingFees.length})
          </h3>
          <div className="space-y-3">
            {pendingFees.map(fee => (
              <div key={fee._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30 overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    fee.status === 'overdue'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : fee.status === 'partial'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <FaMoneyBillWave className={`text-xl ${
                      fee.status === 'overdue' ? 'text-red-500' :
                      fee.status === 'partial' ? 'text-blue-500' : 'text-amber-500'
                    }`} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 dark:text-white capitalize">{fee.feeType} Fee</p>
                      <Badge variant={statusVariant[fee.status] || 'gray'}>{fee.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {fee.month || 'N/A'} · {fee.academicYear}
                    </p>
                    {fee.dueDate && (
                      <p className={`text-xs mt-0.5 font-medium ${
                        new Date(fee.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {new Date(fee.dueDate) < new Date() && ' ⚠️ Overdue'}
                      </p>
                    )}
                  </div>

                  {/* Amount + Pay button */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Due Amount</p>
                    <p className="text-xl font-extrabold text-red-600 dark:text-red-400">
                      ₹{fee.dueAmount?.toLocaleString()}
                    </p>
                    {fee.paidAmount > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ₹{fee.paidAmount?.toLocaleString()} already paid
                      </p>
                    )}
                    <button
                      onClick={() => setPayModal({ fee, childName: child.user?.name ?? 'Student' })}
                      className="mt-2 inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/30">
                      <FaCreditCard /> Pay Now
                    </button>
                  </div>
                </div>

                {/* Progress bar for partial payments */}
                {fee.status === 'partial' && (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                      <span>Payment progress</span>
                      <span>{Math.round((fee.paidAmount / fee.amount) * 100)}%</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(fee.paidAmount / fee.amount) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid fees history */}
      {paidFees.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FaHistory className="text-green-500" />
            Payment History ({paidFees.length})
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    {['Fee Type', 'Month', 'Amount', 'Method', 'Date', 'Receipt', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paidFees.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 capitalize font-medium text-gray-900 dark:text-white">{p.feeType}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.month || '—'}</td>
                      <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{p.paymentMethod?.replace('_', ' ') || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {p.receiptNumber
                          ? <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{p.receiptNumber}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">
                          <FaCheckCircle className="inline mr-1" />paid
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No fees at all */}
      {!pendingFees.length && !paidFees.length && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center">
          <FaReceipt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No fee records found for this student.</p>
        </div>
      )}

      {/* Pay Modal */}
      <Modal
        isOpen={!!payModal}
        onClose={() => setPayModal(null)}
        title={`Pay Fee — ${payModal?.childName || ''}`}
        size="sm">
        {payModal && (
          <PayModal
            fee={payModal.fee}
            childName={payModal.childName}
            onClose={() => setPayModal(null)}
            onSuccess={fetchFees}
          />
        )}
      </Modal>
    </div>
  );
};

export default ParentFeesPage;