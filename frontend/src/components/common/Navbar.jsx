import { Link } from 'react-router-dom'
import { Shield, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav className="bg-slate-800 border-b border-slate-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              MailSentra
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <span className="text-slate-400 hidden md:inline">
                  {user?.username}
                </span>
                <button
  onClick={logout}
  className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:text-white hover:bg-red-600 text-sm rounded-md font-medium transition-colors duration-200 border border-transparent hover:border-red-600"
>
  <LogOut className="h-4 w-4" />
  <span className="hidden sm:inline">Logout</span>
</button>

              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
