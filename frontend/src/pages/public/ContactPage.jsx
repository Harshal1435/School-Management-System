import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us for any queries or information.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: FaMapMarkerAlt, title: 'Address', lines: ['123 School Street', 'Education District', 'City - 400001'], color: 'text-red-500' },
              { icon: FaPhone, title: 'Phone', lines: ['+91 98765 43210', '+91 98765 43211'], color: 'text-green-500' },
              { icon: FaEnvelope, title: 'Email', lines: ['info@edumanage.school', 'admissions@edumanage.school'], color: 'text-blue-500' },
              { icon: FaClock, title: 'Office Hours', lines: ['Monday – Friday: 8AM – 5PM', 'Saturday: 9AM – 1PM', 'Sunday: Closed'], color: 'text-purple-500' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex gap-4">
                  <div className={`${item.color} text-xl mt-1 flex-shrink-0`}>
                    <Icon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-400">{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} required
                        className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required
                        className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                      <input name="subject" value={form.subject} onChange={handleChange}
                        className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            )}

            {/* Map placeholder */}
            <div className="mt-6 bg-gray-200 dark:bg-gray-700 rounded-xl h-48 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt className="text-3xl mx-auto mb-2" />
                <p className="text-sm">Google Maps Integration</p>
                <p className="text-xs">123 School Street, City</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
