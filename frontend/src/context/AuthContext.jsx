import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
  
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('user')
        }
      } else if (token) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
  
    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('token', response.access_token)
      const userData = await authService.getMe()
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      await authService.register(username, email, password)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

