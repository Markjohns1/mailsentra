import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-blue-600">MailSentra</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Welcome, {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

