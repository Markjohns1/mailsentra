import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, LogOut, LayoutDashboard, Settings, BookOpen, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-sm shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all group">
            {/*<div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 sm:p-2 rounded-lg shadow-lg group-hover:shadow-cyan-500/50 transition-shadow">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>*/}
            <span className="text-xl sm:text-2xl font-extrabold text-gradient">
              MailSentra
            </span>
            <span className="text-xs text-cyan-400/70 font-mono hidden sm:inline">v1.0</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-cyan-500/30"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="font-medium text-sm lg:text-base">Dashboard</span>
                </Link>
                
                <Link
                  to="/training"
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 text-slate-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-green-500/30"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium text-sm lg:text-base">Training</span>
                </Link>
                
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-purple-500/30"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium text-sm lg:text-base">Admin</span>
                  </Link>
                )}
                <span className="text-cyan-400/80 hidden lg:inline font-medium text-sm">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-white hover:bg-red-600/20 text-sm rounded-md font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
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
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="pb-3 mb-3 border-b border-slate-700/50">
                  <p className="text-cyan-400 font-semibold text-sm">{user?.username}</p>
                  {user?.is_admin && (
                    <p className="text-purple-400 text-xs mt-1">Administrator</p>
                  )}
                </div>
                
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                
                <Link
                  to="/training"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Training</span>
                </Link>
                
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg font-medium transition-all border border-red-500/30 hover:border-red-500 mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold text-center shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar