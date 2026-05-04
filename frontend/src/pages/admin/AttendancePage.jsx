import { useState, useEffect } from 'react';
import { FaSave, FaCalendarAlt } from 'react-icons/fa';
import { attendanceAPI, classAPI, studentAPI } from '../../services/api';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['present', 'absent', 'late', 'excused'];

const AttendancePage = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classAttendance, setClassAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    attendanceAPI.getClassAttendance(selectedClass, { date })
      .then(({ data }) => {
        setClassAttendance(data.classAttendance);
        // Build initial map from existing records
        const map = {};
        data.classAttendance.forEach(item => {
          map[item.student._id] = item.status === 'not_marked' ? 'present' : item.status;
        });
        setAttendanceMap(map);
      })
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [selectedClass, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const map = {};
    classAttendance.forEach(item => { map[item.student._id] = status; });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error('Please select a class');
    setSaving(true);
    try {
      const attendanceData = classAttendance.map(item => ({
        studentId: item.student._id,
        status: attendanceMap[item.student._id] || 'present',
      }));
      await attendanceAPI.mark({ classId: selectedClass, date, attendanceData });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  const summary = {
    present: Object.values(attendanceMap).filter(s => s === 'present').length,
    absent: Object.values(attendanceMap).filter(s => s === 'absent').length,
    late: Object.values(attendanceMap).filter(s => s === 'late').length,
    excused: Object.values(attendanceMap).filter(s => s === 'excused').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mark and manage daily attendance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Choose a class...</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} - Section {c.section}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {classAttendance.length > 0 && (
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => handleMarkAll(s)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 capitalize">
                  All {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {classAttendance.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Present', count: summary.present, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
            { label: 'Absent', count: summary.absent, color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
            { label: 'Late', count: summary.late, color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
            { label: 'Excused', count: summary.excused, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
          ].map(item => (
            <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-xs font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : !selectedClass ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center text-gray-500 dark:text-gray-400">
          <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-30" />
          <p>Select a class to mark attendance</p>
        </div>
      ) : classAttendance.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center text-gray-500 dark:text-gray-400">
          No students found in this class
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Roll No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {classAttendance.map((item, idx) => (
                  <tr key={item.student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {item.student.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{item.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.student.rollNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(item.student._id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                              attendanceMap[item.student._id] === status
                                ? status === 'present' ? 'bg-green-500 text-white'
                                  : status === 'absent' ? 'bg-red-500 text-white'
                                  : status === 'late' ? 'bg-orange-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <FaSave /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
