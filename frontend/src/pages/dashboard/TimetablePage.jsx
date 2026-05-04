import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { timetableAPI, classAPI, subjectAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyForm = {
  class: '', subject: '', teacher: '', dayOfWeek: 'Monday',
  startTime: '08:00', endTime: '09:00', room: '', academicYear: '2024-25',
};

const TimetablePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
    if (isAdmin) {
      subjectAPI.getAll().then(({ data }) => setSubjects(data.subjects)).catch(() => {});
      teacherAPI.getAll({ limit: 100 }).then(({ data }) => setTeachers(data.teachers)).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    timetableAPI.getByClass(selectedClass)
      .then(({ data }) => setTimetable(data.timetable))
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  // For student: auto-load their class
  useEffect(() => {
    if (!isAdmin && user?.profile?.class?._id) {
      setSelectedClass(user.profile.class._id);
    }
  }, [isAdmin, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await timetableAPI.create(form);
      toast.success('Timetable entry added');
      setModalOpen(false);
      if (selectedClass) {
        const { data } = await timetableAPI.getByClass(selectedClass);
        setTimetable(data.timetable);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this entry?')) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Entry removed');
      setTimetable(timetable.filter(t => t._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  // Group timetable by day
  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View class schedules</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setForm(emptyForm); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            <FaPlus /> Add Entry
          </button>
        )}
      </div>

      {/* Class selector */}
      {(isAdmin || user?.role === 'teacher') && (
        <div>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select a class...</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : !selectedClass ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
          Select a class to view timetable
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 border-b dark:border-gray-700">
                <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">{day}</h3>
              </div>
              {byDay[day].length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">No classes scheduled</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {byDay[day].map((entry) => (
                    <div key={entry._id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 w-24">
                          {entry.startTime} – {entry.endTime}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{entry.subject?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.teacher?.user?.name} {entry.room ? `· Room ${entry.room}` : ''}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDelete(entry._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Timetable Entry" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
              <select name="class" value={form.class} required onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <select name="subject" value={form.subject} required onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher *</label>
              <select name="teacher" value={form.teacher} required onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day *</label>
              <select name="dayOfWeek" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input type="time" name="startTime" value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input type="time" name="endTime" value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
              <input type="text" name="room" value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetablePage;
