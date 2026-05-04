const streams = [
  {
    name: 'Science Stream',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English'],
    color: 'border-blue-500',
    icon: '🔬',
  },
  {
    name: 'Commerce Stream',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Informatics'],
    color: 'border-green-500',
    icon: '📊',
  },
  {
    name: 'Arts Stream',
    subjects: ['History', 'Geography', 'Political Science', 'Psychology', 'English', 'Fine Arts'],
    color: 'border-purple-500',
    icon: '🎨',
  },
];

const coreSubjects = [
  { name: 'Mathematics', icon: '📐', desc: 'From basic arithmetic to advanced calculus' },
  { name: 'English', icon: '📖', desc: 'Language, literature, and communication skills' },
  { name: 'Science', icon: '🔭', desc: 'Physics, Chemistry, and Biology integrated' },
  { name: 'Social Studies', icon: '🌍', desc: 'History, Geography, and Civics' },
  { name: 'Computer Science', icon: '💻', desc: 'Programming, AI, and digital literacy' },
  { name: 'Physical Education', icon: '⚽', desc: 'Sports, fitness, and health education' },
];

const AcademicsPage = () => (
  <div>
    <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Academics</h1>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          A comprehensive curriculum designed to challenge, inspire, and prepare students for the future.
        </p>
      </div>
    </section>

    {/* Core Subjects */}
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Core Subjects</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreSubjects.map((sub) => (
            <div key={sub.name} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{sub.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{sub.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sub.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Senior Secondary Streams */}
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Senior Secondary Streams</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Choose your path for Grade 11 & 12</p>
        <div className="grid md:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div key={stream.name} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-t-4 ${stream.color} p-6`}>
              <div className="text-4xl mb-3">{stream.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{stream.name}</h3>
              <ul className="space-y-2">
                {stream.subjects.map((sub) => (
                  <li key={sub} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Assessment */}
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Assessment System</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { type: 'Unit Tests', weight: '20%', freq: 'Monthly', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { type: 'Mid-Term', weight: '30%', freq: 'Twice/Year', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
            { type: 'Practicals', weight: '20%', freq: 'Quarterly', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
            { type: 'Final Exam', weight: '30%', freq: 'Annual', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
          ].map((item) => (
            <div key={item.type} className={`${item.color} rounded-xl p-6 text-center`}>
              <div className="text-3xl font-bold mb-2">{item.weight}</div>
              <div className="font-semibold text-lg mb-1">{item.type}</div>
              <div className="text-sm opacity-75">{item.freq}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AcademicsPage;
