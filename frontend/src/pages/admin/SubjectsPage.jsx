import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { subjectAPI, teacherAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const typeVariant = { core: 'indigo', elective: 'info', lab: 'success', extracurricular: 'purple' };
const emptyForm = { name: '', code: '', description: '', teacher: '', creditHours: 1, type: 'core', maxMarks: 100, passingMarks: 40 };

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await subjectAPI.getAll();
      setSubjects(data.subjects);
    } catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
  useEffect(() => {
    teacherAPI.getAll({ limit: 100 }).then(({ data }) => setTeachers(data.teachers)).catch(() => {});
  }, []);

  const openCreate = () => { setEditingSubject(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditingSubject(s);
    setForm({ name: s.name, code: s.code, description: s.description || '', teacher: s.teacher?._id || '', creditHours: s.creditHours, type: s.type, maxMarks: s.maxMarks, passingMarks: s.passingMarks });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSubject) {
        await subjectAPI.update(editingSubject._id, form);
        toast.success('Subject updated');
      } else {
        await subjectAPI.create(form);
        toast.success('Subject created');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this subject?')) return;
    try {
      await subjectAPI.delete(id);
      toast.success('Subject deactivated');
      fetchSubjects();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'name', label: 'Subject Name', render: (v) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={typeVariant[v] || 'gray'}>{v}</Badge> },
    { key: 'teacher', label: 'Teacher', render: (t) => t?.user?.name || '—' },
    { key: 'creditHours', label: 'Credits' },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'passingMarks', label: 'Pass Marks' },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all subjects and assignments</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Add Subject
        </button>
      </div>

      <DataTable columns={columns} data={subjects} loading={loading} emptyMessage="No subjects found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSubject ? 'Edit Subject' : 'Add Subject'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name *</label>
              <input type="text" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Code *</label>
              <input type="text" value={form.code} required onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['core', 'elective', 'lab', 'extracurricular'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
              <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Marks</label>
              <input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Marks</label>
              <input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
