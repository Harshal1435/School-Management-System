const StatCard = ({ title, value, icon: Icon, color = 'indigo', change, subtitle }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-start gap-4">
      {Icon && (
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="text-xl" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
