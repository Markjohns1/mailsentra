import { Link } from 'react-router-dom'
import { Shield, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-sm shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg group-hover:shadow-cyan-500/50 transition-shadow cyber-glow-hover">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-gradient">
              MailSentra
            </span>
            <span className="text-xs text-cyan-400/70 font-mono hidden sm:inline">v1.0</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-cyan-500/30"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Dashboard</span>
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-purple-500/30"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Admin</span>
                  </Link>
                )}
                <span className="text-cyan-400/80 hidden md:inline font-medium text-sm">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-white hover:bg-red-600/20 text-sm rounded-md font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-cyan-500/30 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all cyber-glow-hover btn-cyber"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
