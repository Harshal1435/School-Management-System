import { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { resultsAPI, studentAPI, classAPI, subjectAPI } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  student: '', class: '', subject: '', examType: 'midterm',
  academicYear: '2024-25', term: 'term1', marksObtained: '',
  maxMarks: '100', passingMarks: '40', examDate: '',
};

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await resultsAPI.getAll({ page, limit: 15 });
      setResults(data.results);
      setTotalPages(Math.ceil(data.total / 15));
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);
  useEffect(() => {
    Promise.all([
      studentAPI.getAll({ limit: 100 }),
      classAPI.getAll(),
      subjectAPI.getAll(),
    ]).then(([s, c, sub]) => {
      setStudents(s.data.students);
      setClasses(c.data.classes);
      setSubjects(sub.data.subjects);
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await resultsAPI.create(form);
      toast.success('Result added successfully');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add result');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await resultsAPI.delete(id);
      toast.success('Result deleted');
      fetchResults();
    } catch { toast.error('Failed to delete result'); }
  };

  const columns = [
    {
      key: 'student', label: 'Student', render: (s) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{s?.user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{s?.studentId}</p>
        </div>
      ),
    },
    { key: 'subject', label: 'Subject', render: (s) => s?.name },
    { key: 'examType', label: 'Exam Type', render: (v) => <span className="capitalize text-xs">{v?.replace('_', ' ')}</span> },
    { key: 'marksObtained', label: 'Marks', render: (v, row) => `${v}/${row.maxMarks}` },
    {
      key: 'grade', label: 'Grade', render: (v) => v ? <Badge label={v} color={v} /> : '—',
    },
    {
      key: 'marksObtained', label: '%', render: (v, row) =>
        `${((v / row.maxMarks) * 100).toFixed(1)}%`,
    },
    { key: 'academicYear', label: 'Year' },
    { key: 'examDate', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: '_id', label: 'Actions', render: (id) => (
        <button onClick={() => handleDelete(id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs">
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage exam results and marks</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Add Result
        </button>
      </div>

      <DataTable columns={columns} data={results} loading={loading}
        totalPages={totalPages} currentPage={page} onPageChange={setPage} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Result" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
              <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type *</label>
              <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })} required
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['unit_test','midterm','final','assignment','practical'].map(t => (
                  <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            {[
              { name: 'marksObtained', label: 'Marks Obtained *', type: 'number', required: true },
              { name: 'maxMarks', label: 'Max Marks *', type: 'number', required: true },
              { name: 'passingMarks', label: 'Passing Marks', type: 'number' },
              { name: 'academicYear', label: 'Academic Year *', required: true },
              { name: 'examDate', label: 'Exam Date', type: 'date' },
            ].map(({ name, label, type = 'text', required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input type={type} value={form[name]} required={required}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResultsPage;
