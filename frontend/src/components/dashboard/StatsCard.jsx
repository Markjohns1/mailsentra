const StatsCard = ({ title, value, icon, color }) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500/30',
    green: 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30',
    red: 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border-red-500/30',
    purple: 'bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-purple-500/30',
    yellow: 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-500/30',
  }

  const iconClasses = {
    blue: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  }

  return (
    <div className={`card-cyber ${gradientClasses[color]} p-6 rounded-xl shadow-lg border-2 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300 animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">{title}</h3>
          <p className="text-4xl md:text-5xl font-extrabold text-white mb-1">{typeof value === 'string' ? value : value.toLocaleString()}</p>
        </div>
        <div className={`${iconClasses[color]} opacity-90 p-3 bg-${color}-500/10 rounded-lg border border-${color}-500/20`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
