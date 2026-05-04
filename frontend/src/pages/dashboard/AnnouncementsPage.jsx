import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaEdit, FaThumbsUp } from 'react-icons/fa';
import { announcementAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const typeVariant = {
  general: 'gray', academic: 'info', event: 'success',
  holiday: 'purple', exam: 'warning', fee: 'danger', urgent: 'danger',
};

const emptyForm = {
  title: '', content: '', type: 'general',
  targetAudience: ['all'], isPinned: false, isPublished: true,
};

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await announcementAPI.getAll({ page, limit: 10 });
      setAnnouncements(data.announcements);
      setTotalPages(Math.ceil(data.total / 10) || 1);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openCreate = () => { setEditingAnn(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ann) => {
    setEditingAnn(ann);
    setForm({ title: ann.title, content: ann.content, type: ann.type, targetAudience: ann.targetAudience, isPinned: ann.isPinned, isPublished: ann.isPublished });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnn) {
        await announcementAPI.update(editingAnn._id, form);
        toast.success('Announcement updated');
      } else {
        await announcementAPI.create(form);
        toast.success('Announcement created');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      toast.success('Deleted');
      fetchAnnouncements();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">School-wide notices and updates</p>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <FaPlus /> New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
          No announcements found
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 ${
              ann.type === 'urgent' ? 'border-red-500' :
              ann.type === 'exam' ? 'border-yellow-500' :
              ann.type === 'event' ? 'border-green-500' :
              'border-indigo-500'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant={typeVariant[ann.type] || 'gray'}>{ann.type}</Badge>
                    {ann.isPinned && <span className="text-xs text-gray-500">📌 Pinned</span>}
                    {!ann.isPublished && <Badge variant="gray">Draft</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ann.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{ann.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>By {ann.author?.name}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FaThumbsUp className="text-xs" /> {ann.views} views</span>
                    <span>For: {ann.targetAudience?.join(', ')}</span>
                  </div>
                </div>
                {canCreate && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(ann)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"><FaEdit /></button>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(ann._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash /></button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAnn ? 'Edit Announcement' : 'New Announcement'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
            <textarea value={form.content} required rows={4} onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['general', 'academic', 'event', 'holiday', 'exam', 'fee', 'urgent'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
              <select value={form.targetAudience[0]} onChange={(e) => setForm({ ...form, targetAudience: [e.target.value] })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['all', 'admin', 'teacher', 'student', 'parent'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
              Pin announcement
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
              Publish immediately
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingAnn ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
