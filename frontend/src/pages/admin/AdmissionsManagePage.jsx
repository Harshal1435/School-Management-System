import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { admissionAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning', under_review: 'info', approved: 'success',
  rejected: 'danger', waitlisted: 'gray',
};

const AdmissionsManagePage = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await admissionAPI.getAll(params);
      setAdmissions(data.admissions);
      setTotalPages(data.pages || 1);
    } catch { toast.error('Failed to load admissions'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await admissionAPI.update(id, { status, reviewNotes });
      toast.success(`Application ${status}`);
      setViewModal(false);
      fetchAdmissions();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const columns = [
    { key: 'applicationNumber', label: 'App. No' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'applyingForClass', label: 'Class' },
    { key: 'parentName', label: 'Parent' },
    { key: 'parentPhone', label: 'Phone' },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={statusVariant[v] || 'gray'}>{v?.replace('_', ' ')}</Badge>,
    },
    {
      key: 'createdAt', label: 'Applied On',
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <button onClick={() => { setSelected(row); setReviewNotes(row.reviewNotes || ''); setViewModal(true); }}
          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
          <FaEye />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admissions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review and manage admission applications</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          {['pending', 'under_review', 'approved', 'rejected', 'waitlisted'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={admissions} loading={loading} emptyMessage="No applications found" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Admission Application" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selected.studentName}</h3>
                <p className="text-sm text-gray-500">{selected.applicationNumber}</p>
              </div>
              <Badge variant={statusVariant[selected.status] || 'gray'}>{selected.status?.replace('_', ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Date of Birth', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'],
                ['Gender', selected.gender],
                ['Applying for Class', selected.applyingForClass],
                ['Academic Year', selected.academicYear],
                ['Blood Group', selected.bloodGroup],
                ['Previous School', selected.previousSchool],
                ['Parent Name', selected.parentName],
                ['Parent Email', selected.parentEmail],
                ['Parent Phone', selected.parentPhone],
                ['Occupation', selected.parentOccupation],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.address}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Notes</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add review notes..." />
            </div>

            {selected.status === 'pending' || selected.status === 'under_review' ? (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(selected._id, 'under_review')} disabled={updating}
                  className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Mark Under Review
                </button>
                <button onClick={() => updateStatus(selected._id, 'approved')} disabled={updating}
                  className="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <FaCheck /> Approve
                </button>
                <button onClick={() => updateStatus(selected._id, 'rejected')} disabled={updating}
                  className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <FaTimes /> Reject
                </button>
              </div>
            ) : (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Application has been {selected.status}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionsManagePage;
