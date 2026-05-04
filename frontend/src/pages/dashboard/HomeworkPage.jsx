import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { homeworkAPI, classAPI, subjectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', subject: '', class: '', dueDate: '' };

const HomeworkPage = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHW, setEditingHW] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await homeworkAPI.getAll({ page, limit: 10 });
      setHomework(data.homework);
      setTotalPages(Math.ceil(data.total / 10) || 1);
    } catch {
      // For student, try class-based fetch
      if (user?.profile?.class?._id) {
        try {
          const { data } = await homeworkAPI.getByClass(user.profile.class._id);
          setHomework(data.homework);
        } catch { toast.error('Failed to load homework'); }
      }
    } finally { setLoading(false); }
  }, [page, user]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);
  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
    subjectAPI.getAll().then(({ data }) => setSubjects(data.subjects)).catch(() => {});
  }, []);

  const openCreate = () => { setEditingHW(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (hw) => {
    setEditingHW(hw);
    setForm({ title: hw.title, description: hw.description, subject: hw.subject?._id || '', class: hw.class?._id || '', dueDate: hw.dueDate ? hw.dueDate.split('T')[0] : '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingHW) {
        await homeworkAPI.update(editingHW._id, form);
        toast.success('Homework updated');
      } else {
        await homeworkAPI.create(form);
        toast.success('Homework assigned');
      }
      setModalOpen(false);
      fetchHomework();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this homework?')) return;
    try {
      await homeworkAPI.delete(id);
      toast.success('Removed');
      fetchHomework();
    } catch { toast.error('Delete failed'); }
  };

  const isDue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homework</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Assignments and tasks</p>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <FaPlus /> Assign Homework
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : homework.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
          <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-50" />
          <p>No homework assigned</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {homework.map((hw) => (
            <div key={hw._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-t-4 ${isDue(hw.dueDate) ? 'border-red-400' : 'border-indigo-400'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{hw.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {hw.subject?.name} · {hw.class?.name} {hw.class?.section}
                  </p>
                </div>
                {canCreate && (
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEdit(hw)} className="p-1 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"><FaEdit className="text-xs" /></button>
                    <button onClick={() => handleDelete(hw._id)} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FaTrash className="text-xs" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{hw.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="text-xs" />
                  <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                </div>
                <Badge variant={isDue(hw.dueDate) ? 'danger' : 'success'}>
                  {isDue(hw.dueDate) ? 'Overdue' : 'Active'}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                By {hw.teacher?.user?.name} · {hw.submissions?.length || 0} submissions
              </p>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingHW ? 'Edit Homework' : 'Assign Homework'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea value={form.description} required rows={3} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
              <select value={form.class} required onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <select value={form.subject} required onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} required onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingHW ? 'Update' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeworkPage;
