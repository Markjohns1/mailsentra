import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Shield, Mail } from 'lucide-react'
import Login from '../components/auth/Login'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (email, password) => {
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    
    if (result.success) {
      showSuccess('Login successful!')
      navigate('/dashboard')
    } else {
      showError(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-lg text-slate-400">
            Sign in to <span className="text-blue-400 font-semibold">MailSentra</span>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition">
              Create one now
            </Link>
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <Login onLogin={handleLogin} loading={loading} />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Protected by advanced spam detection technology
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          <p>Need help? Contact support</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
