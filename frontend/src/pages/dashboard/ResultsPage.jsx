import { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { resultsAPI, classAPI, subjectAPI, studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const gradeVariant = { 'A+': 'success', A: 'success', 'B+': 'info', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

const emptyForm = {
  student: '', class: '', subject: '', examType: 'midterm',
  academicYear: '2024-25', term: 'term1', marksObtained: '', maxMarks: 100,
  passingMarks: 40, examDate: '', remarks: '',
};

const ResultsPage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classFilter, setClassFilter] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Student view
  const [myResults, setMyResults] = useState(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (classFilter) params.classId = classFilter;
      if (examTypeFilter) params.examType = examTypeFilter;
      const { data } = await resultsAPI.getAll(params);
      setResults(data.results);
      setTotalPages(Math.ceil(data.total / 15) || 1);
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  }, [page, classFilter, examTypeFilter]);

  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetchResults();
      classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
      subjectAPI.getAll().then(({ data }) => setSubjects(data.subjects)).catch(() => {});
      studentAPI.getAll({ limit: 200 }).then(({ data }) => setStudents(data.students)).catch(() => {});
    } else if (user?.profile?._id) {
      resultsAPI.getStudentResults(user.profile._id)
        .then(({ data }) => setMyResults(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isTeacherOrAdmin, user, fetchResults]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await resultsAPI.create(form);
      toast.success('Result added');
      setModalOpen(false);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (s) => s?.user?.name || '—' },
    { key: 'subject', label: 'Subject', render: (s) => s?.name || '—' },
    { key: 'examType', label: 'Exam Type', render: (v) => <span className="capitalize">{v?.replace('_', ' ')}</span> },
    { key: 'marksObtained', label: 'Marks', render: (v, row) => `${v}/${row.maxMarks}` },
    {
      key: 'grade', label: 'Grade',
      render: (v) => <Badge variant={gradeVariant[v] || 'gray'}>{v}</Badge>,
    },
    { key: 'academicYear', label: 'Year' },
    { key: 'examDate', label: 'Exam Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  // Student view
  if (!isTeacherOrAdmin) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View your academic performance</p>
        </div>

        {myResults && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Subjects', value: myResults.summary?.totalSubjects || 0 },
                { label: 'Total Marks', value: `${myResults.summary?.totalMarks || 0}/${myResults.summary?.maxMarks || 0}` },
                { label: 'Percentage', value: `${myResults.summary?.percentage || 0}%` },
                { label: 'Passed', value: myResults.summary?.passed || 0 },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      {['Subject', 'Exam Type', 'Marks', 'Max', 'Grade', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {myResults.results?.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No results found</td></tr>
                    ) : myResults.results?.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.subject?.name}</td>
                        <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{r.examType?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.marksObtained}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.maxMarks}</td>
                        <td className="px-4 py-3"><Badge variant={gradeVariant[r.grade] || 'gray'}>{r.grade}</Badge></td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.examDate ? new Date(r.examDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage student exam results</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <FaPlus /> Add Result
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
        <select value={examTypeFilter} onChange={(e) => { setExamTypeFilter(e.target.value); setPage(1); }}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Exam Types</option>
          {['unit_test', 'midterm', 'final', 'assignment', 'practical'].map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={results} loading={loading} emptyMessage="No results found" />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Result" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student *</label>
              <select name="student" value={form.student} required onChange={(e) => setForm({ ...form, student: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class *</label>
              <select name="class" value={form.class} required onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <select name="subject" value={form.subject} required onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
              <select name="examType" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['unit_test', 'midterm', 'final', 'assignment', 'practical'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks Obtained *</label>
              <input type="number" name="marksObtained" value={form.marksObtained} required
                onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Marks</label>
              <input type="number" name="maxMarks" value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Date</label>
              <input type="date" name="examDate" value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
              <input type="text" name="academicYear" value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResultsPage;
