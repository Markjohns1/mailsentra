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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-xl">
              <UserPlus className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Join MailSentra
          </h2>
          <p className="text-lg text-slate-400">
            Create your account and start protecting your inbox
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition">
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <Register onRegister={handleRegister} loading={loading} />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
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
