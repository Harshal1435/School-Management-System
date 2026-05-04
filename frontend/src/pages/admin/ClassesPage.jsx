import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { classAPI, teacherAPI, subjectAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', section: '', grade: '', classTeacher: '', capacity: 40, room: '', academicYear: '2024-25' };

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await classAPI.getAll();
      setClasses(data.classes);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => {
    teacherAPI.getAll({ limit: 100 }).then(({ data }) => setTeachers(data.teachers)).catch(() => {});
  }, []);

  const openCreate = () => { setEditingClass(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditingClass(c);
    setForm({ name: c.name, section: c.section || '', grade: c.grade, classTeacher: c.classTeacher?._id || '', capacity: c.capacity, room: c.room || '', academicYear: c.academicYear || '2024-25' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingClass) {
        await classAPI.update(editingClass._id, form);
        toast.success('Class updated');
      } else {
        await classAPI.create(form);
        toast.success('Class created');
      }
      setModalOpen(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this class?')) return;
    try {
      await classAPI.delete(id);
      toast.success('Class deactivated');
      fetchClasses();
    } catch { toast.error('Delete failed'); }
  };

  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'section', label: 'Section' },
    { key: 'grade', label: 'Grade' },
    {
      key: 'classTeacher', label: 'Class Teacher',
      render: (ct) => ct?.user?.name || '—',
    },
    { key: 'capacity', label: 'Capacity' },
    {
      key: 'students', label: 'Students',
      render: (students) => students?.length || 0,
    },
    { key: 'room', label: 'Room' },
    { key: 'academicYear', label: 'Academic Year' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage class sections and assignments</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Add Class
        </button>
      </div>

      <DataTable columns={columns} data={classes} loading={loading} emptyMessage="No classes found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingClass ? 'Edit Class' : 'Add New Class'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Class Name', placeholder: 'e.g. Grade 10', required: true },
              { name: 'section', label: 'Section', placeholder: 'e.g. A' },
              { name: 'grade', label: 'Grade (number)', type: 'number', required: true },
              { name: 'capacity', label: 'Capacity', type: 'number' },
              { name: 'room', label: 'Room Number' },
              { name: 'academicYear', label: 'Academic Year' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'} name={f.name} value={form[f.name]} required={f.required}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Teacher</label>
              <select name="classTeacher" value={form.classTeacher} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassesPage;
