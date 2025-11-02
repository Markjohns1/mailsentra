import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Shield, UserPlus } from 'lucide-react'
import Register from '../components/auth/Register'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (username, email, password) => {
    setLoading(true)
    const result = await register(username, email, password)
    setLoading(false)
    
    if (result.success) {
      showSuccess('Registration successful! Please log in.')
      navigate('/login')
    } else {
      showError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl shadow-2xl cyber-glow">
              <UserPlus className="h-14 w-14 text-white" />
            </div>
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-3">
            Join MailSentra
          </h2>
          <p className="text-lg text-slate-300 mb-2">
            Create your account and start protecting your inbox
          </p>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-slow"></span>
            Enterprise-grade security
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-all">
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="card-cyber rounded-2xl shadow-2xl p-8 border-cyan-500/20 backdrop-blur-sm">
          <Register onRegister={handleRegister} loading={loading} />
          
          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <Shield className="h-3 w-3 text-cyan-400/70" />
              By creating an account, you agree to our Terms of Service
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          <p>Questions? Contact support</p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
