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
    <div className={`card-cyber ${gradientClasses[color]} p-5 rounded-lg border backdrop-blur-sm animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-3xl font-extrabold text-white">{typeof value === 'string' ? value : value.toLocaleString()}</p>
        </div>
        <div className={`${iconClasses[color]} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
