import { FaCheckCircle, FaAward, FaUsers, FaGraduationCap } from 'react-icons/fa';

const staff = [
  { name: 'Dr. Rajesh Kumar', role: 'Principal', exp: '20+ years', img: null },
  { name: 'Mrs. Priya Sharma', role: 'Vice Principal', exp: '15+ years', img: null },
  { name: 'Mr. Amit Singh', role: 'Head of Science', exp: '12+ years', img: null },
  { name: 'Ms. Sunita Patel', role: 'Head of Arts', exp: '10+ years', img: null },
];

const milestones = [
  { year: '1985', event: 'School founded with 200 students' },
  { year: '1995', event: 'Expanded to Senior Secondary level' },
  { year: '2005', event: 'Achieved CBSE affiliation' },
  { year: '2015', event: 'Launched digital learning labs' },
  { year: '2020', event: 'Introduced ERP management system' },
  { year: '2024', event: 'Ranked #1 school in the region' },
];

const AboutPage = () => (
  <div>
    {/* Hero */}
    <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">About EduManage School</h1>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          Four decades of excellence in education, shaping generations of leaders and innovators.
        </p>
      </div>
    </section>

    {/* History */}
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our History</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Founded in 1985, EduManage School began as a small institution with a vision to provide quality education to every child. Over four decades, we have grown into one of the most respected educational institutions in the region.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our journey has been marked by continuous innovation, dedicated faculty, and an unwavering commitment to student success. Today, we serve over 2,500 students across all grades.
            </p>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.year} className="flex items-start gap-4">
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
                    {m.year}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm pt-1">{m.event}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: FaUsers, value: '2,500+', label: 'Students' },
                { icon: FaGraduationCap, value: '150+', label: 'Teachers' },
                { icon: FaAward, value: '200+', label: 'Awards' },
                { icon: FaCheckCircle, value: '98%', label: 'Pass Rate' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="text-center bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                    <Icon className="text-indigo-600 dark:text-indigo-400 text-2xl mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-l-4 border-indigo-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎯 Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To provide a transformative educational experience that empowers students with knowledge, skills, and values to become responsible global citizens.
            </p>
            <ul className="space-y-2">
              {['Academic excellence', 'Character development', 'Innovation & creativity', 'Inclusive education'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-l-4 border-purple-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔭 Our Vision</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To be the leading educational institution that nurtures future leaders, innovators, and compassionate human beings who contribute positively to society.
            </p>
            <ul className="space-y-2">
              {['World-class education', 'Technology integration', 'Global perspective', 'Community impact'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <FaCheckCircle className="text-purple-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Staff */}
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Leadership Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((member) => (
            <div key={member.name} className="text-center bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm">{member.role}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{member.exp} experience</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
