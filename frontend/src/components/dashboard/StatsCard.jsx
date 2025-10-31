const StatsCard = ({ title, value, icon, color }) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/50',
    green: 'bg-gradient-to-br from-green-600 to-green-700 border-green-500/50',
    red: 'bg-gradient-to-br from-red-600 to-red-700 border-red-500/50',
    purple: 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500/50',
    yellow: 'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500/50',
  }

  const textClasses = {
    blue: 'text-blue-100',
    green: 'text-green-100',
    red: 'text-red-100',
    purple: 'text-purple-100',
    yellow: 'text-yellow-100',
  }

  return (
    <div className={`${gradientClasses[color]} p-6 rounded-xl shadow-xl border transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-medium ${textClasses[color]} mb-2`}>{title}</h3>
          <p className="text-3xl md:text-4xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
        <div className="text-white opacity-80">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
