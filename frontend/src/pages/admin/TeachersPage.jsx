import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  qualification: '', specialization: '', experience: '', salary: '',
  gender: '', dateOfBirth: '', joiningDate: '',
};

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await teacherAPI.getAll(params);
      setTeachers(data.teachers);
      setTotalPages(data.pages || 1);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const openCreate = () => { setEditingTeacher(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditingTeacher(t);
    setForm({
      name: t.user?.name || '', email: t.user?.email || '', password: '',
      phone: t.user?.phone || '', qualification: t.qualification || '',
      specialization: t.specialization || '', experience: t.experience || '',
      salary: t.salary || '', gender: t.gender || '',
      dateOfBirth: t.dateOfBirth ? t.dateOfBirth.split('T')[0] : '',
      joiningDate: t.joiningDate ? t.joiningDate.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTeacher) {
        await teacherAPI.update(editingTeacher._id, form);
        toast.success('Teacher updated');
      } else {
        await teacherAPI.create(form);
        toast.success('Teacher created');
      }
      setModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this teacher?')) return;
    try {
      await teacherAPI.delete(id);
      toast.success('Teacher deactivated');
      fetchTeachers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'user', label: 'Teacher',
      render: (user, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400">{row.teacherId}</p>
          </div>
        </div>
      ),
    },
    { key: 'user', label: 'Email', render: (user) => <span className="text-xs">{user?.email}</span> },
    { key: 'qualification', label: 'Qualification' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience', render: (v) => v ? `${v} yrs` : '—' },
    {
      key: 'isActive', label: 'Status',
      render: (v) => <Badge variant={v !== false ? 'success' : 'danger'}>{v !== false ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedTeacher(row); setViewModal(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><FaEye /></button>
          <button onClick={() => openEdit(row)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"><FaEdit /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all teacher records</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Add Teacher
        </button>
      </div>

      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text" placeholder="Search teachers..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <DataTable columns={columns} data={teachers} loading={loading} emptyMessage="No teachers found" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Full Name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: !editingTeacher },
              { name: 'password', label: editingTeacher ? 'New Password (leave blank)' : 'Password', type: 'password', required: !editingTeacher },
              { name: 'phone', label: 'Phone' },
              { name: 'qualification', label: 'Qualification' },
              { name: 'specialization', label: 'Specialization' },
              { name: 'experience', label: 'Experience (years)', type: 'number' },
              { name: 'salary', label: 'Salary', type: 'number' },
              { name: 'joiningDate', label: 'Joining Date', type: 'date' },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
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
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingTeacher ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Teacher Details" size="md">
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
                {selectedTeacher.user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTeacher.user?.name}</h3>
                <p className="text-sm text-gray-500">{selectedTeacher.teacherId} · {selectedTeacher.employeeId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Email', selectedTeacher.user?.email],
                ['Phone', selectedTeacher.user?.phone],
                ['Qualification', selectedTeacher.qualification],
                ['Specialization', selectedTeacher.specialization],
                ['Experience', selectedTeacher.experience ? `${selectedTeacher.experience} years` : '—'],
                ['Salary', selectedTeacher.salary ? `₹${selectedTeacher.salary.toLocaleString()}` : '—'],
                ['Gender', selectedTeacher.gender],
                ['Joining Date', selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : '—'],
                ['Classes', selectedTeacher.assignedClasses?.map(c => c.name).join(', ') || '—'],
                ['Subjects', selectedTeacher.assignedSubjects?.map(s => s.name).join(', ') || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachersPage;
