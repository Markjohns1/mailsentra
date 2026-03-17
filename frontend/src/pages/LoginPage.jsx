import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-xl font-extrabold text-white tracking-tight">MailSentra</h1>
          <p className="text-xs text-slate-500 mt-1">Spam Detection System</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <p className="text-sm font-medium text-slate-300 mb-5">Sign in to your account</p>
          <Login onLogin={handleLogin} loading={loading} />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
