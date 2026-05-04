import { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { attendanceAPI, classAPI, studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const statusVariant = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' };
const statusIcon = { present: FaCheck, absent: FaTimes, late: FaClock, excused: FaCheck };

const AttendancePage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classAttendance, setClassAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // For student/parent view
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isTeacherOrAdmin) {
      classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
    }
  }, [isTeacherOrAdmin]);

  const loadClassAttendance = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const { data } = await attendanceAPI.getClassAttendance(selectedClass, { date });
      setClassAttendance(data.classAttendance);
      // Pre-fill existing statuses
      const map = {};
      data.classAttendance.forEach((item) => {
        if (item.status !== 'not_marked') map[item.student._id] = item.status;
      });
      setAttendanceMap(map);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  }, [selectedClass, date]);

  useEffect(() => { loadClassAttendance(); }, [loadClassAttendance]);

  // Student/parent: load own summary
  useEffect(() => {
    if (!isTeacherOrAdmin && user?.profile?._id) {
      attendanceAPI.getSummary(user.profile._id, { month, year })
        .then(({ data }) => { setSummary(data.summary); setRecords(data.records); })
        .catch(() => {});
    }
  }, [isTeacherOrAdmin, user, month, year]);

  const markAll = (status) => {
    const map = {};
    classAttendance.forEach((item) => { map[item.student._id] = status; });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const attendanceData = classAttendance.map((item) => ({
        studentId: item.student._id,
        status: attendanceMap[item.student._id] || 'absent',
      }));
      await attendanceAPI.mark({ classId: selectedClass, date, attendanceData });
      toast.success('Attendance saved successfully');
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  // Teacher/Admin view
  if (isTeacherOrAdmin) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Mark and manage daily attendance</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Choose class...</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {classAttendance.length > 0 && (
            <div className="flex gap-2">
              {['present', 'absent', 'late'].map((s) => (
                <button key={s} onClick={() => markAll(s)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium capitalize ${
                    s === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    s === 'absent' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                    'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}>
                  All {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Sheet */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : classAttendance.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {classAttendance.map((item, idx) => (
                      <tr key={item.student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                              {item.student.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.student.name}</p>
                              <p className="text-xs text-gray-400">{item.student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {['present', 'absent', 'late', 'excused'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setAttendanceMap({ ...attendanceMap, [item.student._id]: s })}
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                                  attendanceMap[item.student._id] === s
                                    ? s === 'present' ? 'bg-green-500 text-white' :
                                      s === 'absent' ? 'bg-red-500 text-white' :
                                      s === 'late' ? 'bg-yellow-500 text-white' :
                                      'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</> : 'Save Attendance'}
              </button>
            </div>
          </>
        ) : selectedClass ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
            No students found in this class
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400">
            <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-50" />
            <p>Select a class to view attendance</p>
          </div>
        )}
      </div>
    );
  }

  // Student/Parent view
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View your attendance records</p>
      </div>

      {/* Month/Year filter */}
      <div className="flex gap-3">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {[2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Days', value: summary.total, color: 'bg-gray-100 dark:bg-gray-700' },
            { label: 'Present', value: summary.present, color: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Absent', value: summary.absent, color: 'bg-red-100 dark:bg-red-900/30' },
            { label: 'Attendance %', value: `${summary.percentage}%`, color: 'bg-indigo-100 dark:bg-indigo-900/30' },
          ].map((item) => (
            <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {records.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No records for this period</td></tr>
              ) : records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[r.status] || 'gray'}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
