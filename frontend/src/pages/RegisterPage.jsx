import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      showSuccess('Registration successful! Please login.')
      navigate('/login')
    } else {
      showError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </a>
          </p>
        </div>
        <Register onRegister={handleRegister} loading={loading} />
      </div>
    </div>
  )
}

export default RegisterPage

