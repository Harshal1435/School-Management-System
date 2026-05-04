import { useState } from 'react';

const categories = ['All', 'Sports', 'Events', 'Academics', 'Cultural', 'Infrastructure'];

// Placeholder gallery items using gradient colors
const galleryItems = [
  { id: 1, title: 'Annual Sports Day 2024', category: 'Sports', color: 'from-blue-400 to-blue-600', emoji: '🏆' },
  { id: 2, title: 'Science Exhibition', category: 'Academics', color: 'from-green-400 to-green-600', emoji: '🔬' },
  { id: 3, title: 'Cultural Festival', category: 'Cultural', color: 'from-purple-400 to-purple-600', emoji: '🎭' },
  { id: 4, title: 'Basketball Tournament', category: 'Sports', color: 'from-orange-400 to-orange-600', emoji: '🏀' },
  { id: 5, title: 'Graduation Ceremony', category: 'Events', color: 'from-indigo-400 to-indigo-600', emoji: '🎓' },
  { id: 6, title: 'New Library Wing', category: 'Infrastructure', color: 'from-teal-400 to-teal-600', emoji: '📚' },
  { id: 7, title: 'Art Exhibition', category: 'Cultural', color: 'from-pink-400 to-pink-600', emoji: '🎨' },
  { id: 8, title: 'Math Olympiad', category: 'Academics', color: 'from-yellow-400 to-yellow-600', emoji: '📐' },
  { id: 9, title: 'Annual Day 2024', category: 'Events', color: 'from-red-400 to-red-600', emoji: '🎉' },
  { id: 10, title: 'Swimming Competition', category: 'Sports', color: 'from-cyan-400 to-cyan-600', emoji: '🏊' },
  { id: 11, title: 'Computer Lab', category: 'Infrastructure', color: 'from-gray-400 to-gray-600', emoji: '💻' },
  { id: 12, title: 'Music Concert', category: 'Cultural', color: 'from-violet-400 to-violet-600', emoji: '🎵' },
];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Capturing memories and milestones from our vibrant school life.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`bg-gradient-to-br ${item.color} h-40 flex items-center justify-center relative`}>
                  <span className="text-5xl">{item.emoji}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                    <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-medium">{item.title}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${selected.color} h-64 flex items-center justify-center`}>
              <span className="text-8xl">{selected.emoji}</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{selected.category}</p>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
