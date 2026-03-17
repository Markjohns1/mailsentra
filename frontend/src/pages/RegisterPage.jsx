import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-xl font-extrabold text-white tracking-tight">MailSentra</h1>
          <p className="text-xs text-slate-500 mt-1">Spam Detection System</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <p className="text-sm font-medium text-slate-300 mb-5">Create your account</p>
          <Register onRegister={handleRegister} loading={loading} />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
