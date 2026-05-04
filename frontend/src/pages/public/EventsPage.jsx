import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { announcementAPI } from '../../services/api';

const upcomingEvents = [
  { title: 'Annual Sports Day', date: '2025-12-15', time: '9:00 AM', venue: 'School Ground', type: 'Sports', color: 'bg-blue-100 text-blue-700' },
  { title: 'Science Exhibition', date: '2025-11-20', time: '10:00 AM', venue: 'Science Block', type: 'Academic', color: 'bg-green-100 text-green-700' },
  { title: 'Cultural Festival', date: '2025-12-01', time: '5:00 PM', venue: 'Auditorium', type: 'Cultural', color: 'bg-purple-100 text-purple-700' },
  { title: 'Parent-Teacher Meeting', date: '2025-11-25', time: '2:00 PM', venue: 'Classrooms', type: 'Meeting', color: 'bg-orange-100 text-orange-700' },
];

const EventsPage = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    announcementAPI.getPublic()
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Events & News</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Stay updated with the latest happenings at EduManage School.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex gap-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900 rounded-xl p-3 text-center min-w-[60px]">
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-indigo-500 dark:text-indigo-300 text-xs">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.color}`}>{event.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><FaClock className="text-xs" />{event.time}</span>
                      <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-xs" />{event.venue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest News</h2>
            <div className="space-y-4">
              {announcements.length > 0 ? announcements.map((ann) => (
                <div key={ann._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ann.type === 'urgent' ? 'bg-red-100 text-red-700' :
                      ann.type === 'exam' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{ann.type}</span>
                    {ann.isPinned && <span className="text-xs">📌</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{ann.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="text-3xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No announcements yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
