import { useState } from 'react';
import { FaUpload, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { admissionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdmissionsPage = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState('');
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    studentName: '', dateOfBirth: '', gender: '', applyingForClass: '',
    academicYear: '2025-26', previousSchool: '', previousClass: '',
    parentName: '', parentEmail: '', parentPhone: '', parentOccupation: '',
    address: '', bloodGroup: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await admissionAPI.submit(form);
      setAppNumber(data.applicationNumber);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!statusQuery.trim()) return;
    try {
      const { data } = await admissionAPI.checkStatus(statusQuery.trim());
      setStatusResult(data.admission);
    } catch {
      toast.error('Application not found');
      setStatusResult(null);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-gray-100 text-gray-700',
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your application number is:</p>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{appNumber}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please save this number to track your application status. We will contact you within 5–7 business days.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ studentName: '', dateOfBirth: '', gender: '', applyingForClass: '', academicYear: '2025-26', previousSchool: '', previousClass: '', parentName: '', parentEmail: '', parentPhone: '', parentOccupation: '', address: '', bloodGroup: '' }); }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Admissions 2025–26</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Join our family of learners. Applications are open for all grades.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Guidelines */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Admission Guidelines</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {[
                  'Age criteria: 5+ years for Grade 1',
                  'Previous academic records required',
                  'Entrance test for Grade 6 and above',
                  'Interview for parents and students',
                  'Documents: Birth certificate, Aadhar, Photos',
                  'Transfer certificate from previous school',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Status Check */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Check Application Status</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Application Number"
                  value={statusQuery}
                  onChange={(e) => setStatusQuery(e.target.value)}
                  className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={checkStatus}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <FaSearch />
                </button>
              </div>
              {statusResult && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{statusResult.studentName}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{statusResult.applicationNumber}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[statusResult.status]}`}>
                    {statusResult.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Online Application Form</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name *</label>
                    <input name="studentName" value={form.studentName} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applying for Class *</label>
                    <select name="applyingForClass" value={form.applyingForClass} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Class</option>
                      {['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous School</label>
                    <input name="previousSchool" value={form.previousSchool} onChange={handleChange}
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <hr className="dark:border-gray-700" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Parent/Guardian Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Name *</label>
                    <input name="parentName" value={form.parentName} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Email *</label>
                    <input type="email" name="parentEmail" value={form.parentEmail} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone *</label>
                    <input name="parentPhone" value={form.parentPhone} onChange={handleChange} required
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                    <input name="parentOccupation" value={form.parentOccupation} onChange={handleChange}
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange} required rows={3}
                    className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Submitting...</>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsPage;
