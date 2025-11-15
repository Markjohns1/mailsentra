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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          {/* shiled icon ..<div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl shadow-2xl cyber-glow">
              <Shield className="h-14 w-14 text-white" />
            </div>
          </div>
          */}
          <h2 className="text-5xl font-extrabold text-white mb-3">
            Welcome Back
          </h2>
          <p className="text-lg text-slate-300 mb-2">
            Sign in to <span className="text-gradient font-bold">MailSentra</span>
          </p>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-slow"></span>
            Enterprise-grade spam detection
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-all">
              Create one now
            </Link>
          </p>
        </div>

        <div className="card-cyber rounded-2xl shadow-2xl p-8 border-cyan-500/20 backdrop-blur-sm">
          <Login onLogin={handleLogin} loading={loading} />
          
          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <Shield className="h-3 w-3 text-cyan-400" strokeWidth={2.5} />
              Protected by advanced AI-powered spam detection
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
