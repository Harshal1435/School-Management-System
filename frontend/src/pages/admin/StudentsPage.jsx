import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { studentAPI, classAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import usePolling from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const feeStatusVariant = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };

const emptyForm = {
  name: '', email: '', password: '', phone: '', classId: '', section: '',
  dateOfBirth: '', gender: '', bloodGroup: '', parentName: '', parentPhone: '',
  parentEmail: '', address: '', rollNumber: '',
};

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (classFilter) params.classId = classFilter;
      const { data } = await studentAPI.getAll(params);
      setStudents(data.students);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, classFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  usePolling(fetchStudents, 20000, [page, search, classFilter]);
  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  const openCreate = () => { setEditingStudent(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditingStudent(s);
    setForm({
      name: s.user?.name || '', email: s.user?.email || '', password: '',
      phone: s.user?.phone || '', classId: s.class?._id || '', section: s.section || '',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
      gender: s.gender || '', bloodGroup: s.bloodGroup || '',
      parentName: s.parentName || '', parentPhone: s.parentPhone || '',
      parentEmail: s.parentEmail || '', address: s.address || '', rollNumber: s.rollNumber || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent._id, form);
        toast.success('Student updated');
      } else {
        await studentAPI.create(form);
        toast.success('Student created');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deactivated');
      fetchStudents();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'user', label: 'Student',
      render: (user, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400">{row.studentId}</p>
          </div>
        </div>
      ),
    },
    { key: 'user', label: 'Email', render: (user) => <span className="text-xs">{user?.email}</span> },
    {
      key: 'class', label: 'Class',
      render: (cls, row) => cls ? `${cls.name} - ${row.section || cls.section || ''}` : '—',
    },
    { key: 'rollNumber', label: 'Roll No' },
    {
      key: 'feeStatus', label: 'Fee Status',
      render: (v) => <Badge variant={feeStatusVariant[v] || 'gray'}>{v}</Badge>,
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedStudent(row); setViewModal(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View"><FaEye /></button>
          <button onClick={() => openEdit(row)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg" title="Edit"><FaEdit /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><FaTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all student records</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <FaPlus /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text" placeholder="Search students..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={students} loading={loading} emptyMessage="No students found" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add New Student'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Full Name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: !editingStudent },
              { name: 'password', label: editingStudent ? 'New Password (leave blank)' : 'Password', type: 'password', required: !editingStudent },
              { name: 'phone', label: 'Phone' },
              { name: 'rollNumber', label: 'Roll Number' },
              { name: 'section', label: 'Section' },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
              { name: 'parentName', label: 'Parent Name' },
              { name: 'parentPhone', label: 'Parent Phone' },
              { name: 'parentEmail', label: 'Parent Email', type: 'email' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'} name={f.name} value={form[f.name]} required={f.required}
                  onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select name="classId" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea name="address" value={form.address} rows={2}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingStudent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Student Details" size="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                {selectedStudent.user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedStudent.user?.name}</h3>
                <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
                <Badge variant={feeStatusVariant[selectedStudent.feeStatus] || 'gray'}>{selectedStudent.feeStatus}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Email', selectedStudent.user?.email],
                ['Phone', selectedStudent.user?.phone],
                ['Class', selectedStudent.class ? `${selectedStudent.class.name} - ${selectedStudent.section}` : '—'],
                ['Roll No', selectedStudent.rollNumber],
                ['Gender', selectedStudent.gender],
                ['Blood Group', selectedStudent.bloodGroup],
                ['Parent', selectedStudent.parentName],
                ['Parent Phone', selectedStudent.parentPhone],
                ['Admission No', selectedStudent.admissionNumber],
                ['Admission Date', selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
            {selectedStudent.address && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Address</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedStudent.address}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage;
