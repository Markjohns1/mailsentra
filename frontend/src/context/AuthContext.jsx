import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token is valid by checking user info
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // TODO: Add endpoint to verify token and get user info
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // TODO: Replace with actual auth endpoint when backend is ready
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: email, // FastAPI OAuth2 uses 'username' field
        password
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setUser({ email, token: access_token })
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      // TODO: Replace with actual register endpoint when backend is ready
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      })

      return { success: true, data: response.data }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    navigate('/')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}