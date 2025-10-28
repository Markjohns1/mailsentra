import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/auth'

export const authService = {
  async login(email, password) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await axios.post(`${BASE_URL}/login`, formData)
    return response.data
  },

  async register(username, email, password) {
    const response = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
    })
    return response.data
  },

  async getMe() {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async logout() {
    localStorage.removeItem('token')
  },
}