import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-extrabold text-slate-700 mb-2">404</h1>
        <p className="text-sm text-slate-400 mb-6">Page not found</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 rounded-lg font-medium transition-all border border-slate-700 hover:border-cyan-500/30"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
