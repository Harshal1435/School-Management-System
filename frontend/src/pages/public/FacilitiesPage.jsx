const facilities = [
  {
    name: 'Modern Library',
    icon: '📚',
    desc: 'Over 10,000 books, digital resources, and quiet study spaces. Open 7 days a week.',
    features: ['10,000+ books', 'Digital catalog', 'E-library access', 'Reading rooms'],
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  {
    name: 'Science Labs',
    icon: '🔬',
    desc: 'State-of-the-art Physics, Chemistry, and Biology laboratories with modern equipment.',
    features: ['Physics lab', 'Chemistry lab', 'Biology lab', 'Safety equipment'],
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  {
    name: 'Computer Lab',
    icon: '💻',
    desc: '100+ high-speed computers with latest software and high-speed internet connectivity.',
    features: ['100+ computers', 'High-speed internet', 'Latest software', 'Coding tools'],
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  },
  {
    name: 'Sports Complex',
    icon: '⚽',
    desc: 'Multi-sport facilities including cricket ground, basketball court, and swimming pool.',
    features: ['Cricket ground', 'Basketball court', 'Swimming pool', 'Indoor games'],
    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  },
  {
    name: 'Auditorium',
    icon: '🎭',
    desc: 'A 500-seat auditorium for cultural events, seminars, and annual functions.',
    features: ['500 seats', 'AV system', 'Stage lighting', 'AC facility'],
    color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
  },
  {
    name: 'Cafeteria',
    icon: '🍽️',
    desc: 'Hygienic cafeteria serving nutritious meals and snacks throughout the day.',
    features: ['Nutritious meals', 'Hygienic kitchen', 'Seating for 300', 'Vegetarian options'],
    color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  },
  {
    name: 'Medical Room',
    icon: '🏥',
    desc: 'Fully equipped medical room with qualified nurse and first-aid facilities.',
    features: ['Qualified nurse', 'First aid', 'Emergency care', 'Health records'],
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  {
    name: 'Smart Classrooms',
    icon: '🖥️',
    desc: 'All classrooms equipped with smart boards, projectors, and interactive learning tools.',
    features: ['Smart boards', 'Projectors', 'AC rooms', 'Wi-Fi enabled'],
    color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  },
];

const FacilitiesPage = () => (
  <div>
    <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Facilities</h1>
        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
          World-class infrastructure designed to support every aspect of student development.
        </p>
      </div>
    </section>

    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility) => (
            <div key={facility.name} className={`rounded-xl border p-6 ${facility.color} hover:shadow-md transition-shadow`}>
              <div className="text-4xl mb-3">{facility.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{facility.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{facility.desc}</p>
              <ul className="space-y-1">
                {facility.features.map((f) => (
                  <li key={f} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default FacilitiesPage;
