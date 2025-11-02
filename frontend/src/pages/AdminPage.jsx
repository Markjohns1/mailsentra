import React, { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Menu, X, AlertCircle, CheckCircle, Clock, Zap, Trash2, Edit2, Power, Eye, Check, XCircle, Shield } from 'lucide-react'
import { LayoutDashboard, Users, FileText, MessageSquare, Cpu } from 'lucide-react'

// Real auth hook - gets actual logged-in user from localStorage
const useAuth = () => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  return { user }
}

const useToast = () => ({
  showError: (msg) => alert('Error: ' + msg),
  showSuccess: (msg) => alert('Success: ' + msg)
})

const API_BASE_URL = 'http://localhost:8000/api'
export default function AdminPage() {
  const { user } = useAuth() || {}
  const { showError, showSuccess } = useToast() || {}
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [feedback, setFeedback] = useState([])
  const [retrainStatus, setRetrainStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [viewingFeedback, setViewingFeedback] = useState(null)
  const [feedbackFilter, setFeedbackFilter] = useState('all') // all, misclassified, correct

  useEffect(() => {
    loadMetrics()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    else if (activeTab === 'logs') loadLogs()
    else if (activeTab === 'feedback') loadFeedback()
    else if (activeTab === 'model') loadRetrainStatus()
  }, [activeTab])

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load stats')
      const data = await res.json()
      setMetrics({
        total_scans: data.total_analyses ?? 0,
        spam_detected: data.spam_detected ?? 0,
        total_users: data.total_users ?? 0,
        accuracy_rate: data.system_accuracy ?? 0,
        spam_percentage: data.spam_percentage ?? 0,
      })
    } catch (e) {
      showError?.(String(e))
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?limit=100`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      showError?.(String(e))
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/spam-logs?limit=50`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load logs')
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (e) {
      showError?.(String(e))
    } finally {
      setLoading(false)
    }
  }

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedback?limit=50`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load feedback')
      const data = await res.json()
      setFeedback(data.feedbacks || [])
    } catch (e) {
      showError?.(String(e))
    } finally {
      setLoading(false)
    }
  }

  const loadRetrainStatus = async () => {
    setLoading(true)
    try {
      // FIXED: Changed from /admin/retrain/status to /retrain/status
      const res = await fetch(`${API_BASE_URL}/retrain/status`, { headers: getHeaders() })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to load retrain status')
      }
      const data = await res.json()
      setRetrainStatus(data)
    } catch (e) {
      showError?.('Retrain Status Error: ' + String(e))
      console.error('Full error:', e)
    } finally {
      setLoading(false)
    }
  }

  const triggerRetrain = async () => {
    if (!confirm('Retrain model with user feedback? This will take a few minutes.')) return
    setRetraining(true)
    try {
      // FIXED: Changed from /admin/retrain to /retrain
      const res = await fetch(`${API_BASE_URL}/retrain`, {
        method: 'POST',
        headers: getHeaders()
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Retraining failed')
      }
      const data = await res.json()
      showSuccess?.(`Model retrained! New accuracy: ${(data.training_stats.accuracy * 100).toFixed(2)}%`)
      loadRetrainStatus()
      loadMetrics()
    } catch (e) {
      showError?.('Retrain Error: ' + String(e))
      console.error('Full error:', e)
    } finally {
      setRetraining(false)
    }
  }

  const triggerInitialTrain = async () => {
    if (!confirm('Train model from scratch? This will take a few minutes.')) return
    setRetraining(true)
    try {
      // FIXED: Changed from /admin/train to /train
      const res = await fetch(`${API_BASE_URL}/retrain/train`, {
        method: 'POST',
        headers: getHeaders()
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Training failed')
      }
      const data = await res.json()
      showSuccess?.(`Model trained! Accuracy: ${(data.training_stats.accuracy * 100).toFixed(2)}%`)
      loadRetrainStatus()
      loadMetrics()
    } catch (e) {
      showError?.('Training Error: ' + String(e))
      console.error('Full error:', e)
    } finally {
      setRetraining(false)
    }
  }

  const deleteFeedback = async (feedbackId) => {
    if (!confirm('Delete this feedback?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete feedback')
      showSuccess?.('Feedback deleted')
      loadFeedback()
    } catch (e) {
      showError?.(String(e))
    }
  }

  const viewFeedbackDetails = async (feedbackId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/details`, { 
        headers: getHeaders() 
      })
      if (!res.ok) throw new Error('Failed to load feedback details')
      const data = await res.json()
      setViewingFeedback(data)
    } catch (e) {
      showError?.(String(e))
    }
  }

  const deleteOldLogs = async (daysOld) => {
    const confirmMsg = daysOld === 0 
      ? '⚠️ Delete ALL logs immediately? This cannot be undone!'
      : `Delete all logs older than ${daysOld} day${daysOld === 1 ? '' : 's'}?`
    if (!confirm(confirmMsg)) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bulk/delete-old-logs?days_old=${daysOld}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Deletion failed')
      const data = await res.json()
      showSuccess?.(data.message)
      loadMetrics()
    } catch (e) {
      showError?.(String(e))
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (!res.ok) throw new Error('Failed to update user')
      showSuccess?.('User updated')
      loadUsers()
    } catch (e) {
      showError?.(String(e))
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Failed to delete user')
      showSuccess?.('User deleted')
      loadUsers()
    } catch (e) {
      showError?.(String(e))
    }
  }

  const openEditUser = (u) => {
    setEditingUser(u.id)
    setEditForm({
      username: u.username,
      email: u.email,
      is_active: u.is_active,
      is_admin: u.is_admin
    })
  }

  const saveEditUser = async () => {
    try {
      if (editingUser === 'new') {
        const res = await fetch(`${API_BASE_URL}/admin/users/create`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(editForm)
        })
        if (!res.ok) throw new Error('Failed to create user')
        showSuccess?.('User created')
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/users/${editingUser}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(editForm)
        })
        if (!res.ok) throw new Error('Failed to update user')
        showSuccess?.('User updated')
      }
      setEditingUser(null)
      loadUsers()
    } catch (e) {
      showError?.(String(e))
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'logs', label: 'Logs', icon: <FileText size={20} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    { id: 'model', label: 'Model', icon: <Cpu size={20} /> },
    { id: 'cleanup', label: 'Cleanup', icon: <Trash2 size={20} /> }
  ]

  const chartData = [
    { name: 'Spam', value: metrics?.spam_detected || 0 },
    { name: 'Ham', value: (metrics?.total_scans || 0) - (metrics?.spam_detected || 0) }
  ]

  const COLORS = ['#ef4444', '#10b981']

  const filteredFeedback = feedback.filter(f => {
    if (feedbackFilter === 'misclassified') return f.was_misclassified
    if (feedbackFilter === 'correct') return !f.was_misclassified
    return true
  })

  const misclassifiedCount = feedback.filter(f => f.was_misclassified).length

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-grid-pattern">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950/90 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-extrabold text-gradient flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              MailSentra
            </h1>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-cyan-400 transition-all p-2 rounded-lg hover:bg-slate-800/50">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-cyan-300 border-transparent hover:border-cyan-500/30'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              <p className="font-semibold text-white mb-1">{user?.username}</p>
              <p className="text-xs">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-slow"></span>
              System monitoring and management
            </p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && metrics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-cyber bg-gradient-to-br from-cyan-600/20 to-blue-600/20 p-6 rounded-xl shadow-lg border-2 border-cyan-500/30 backdrop-blur-sm animate-fade-in">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Total Scans</h3>
                  <p className="text-4xl font-extrabold text-white">{metrics.total_scans.toLocaleString()}</p>
                </div>
                <div className="card-cyber bg-gradient-to-br from-red-600/20 to-rose-600/20 p-6 rounded-xl shadow-lg border-2 border-red-500/30 backdrop-blur-sm animate-fade-in">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Spam Detected</h3>
                  <p className="text-4xl font-extrabold text-white">{metrics.spam_detected.toLocaleString()}</p>
                </div>
                <div className="card-cyber bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 rounded-xl shadow-lg border-2 border-green-500/30 backdrop-blur-sm animate-fade-in">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Total Users</h3>
                  <p className="text-4xl font-extrabold text-white">{metrics.total_users.toLocaleString()}</p>
                </div>
                <div className="card-cyber bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-6 rounded-xl shadow-lg border-2 border-purple-500/30 backdrop-blur-sm animate-fade-in">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Accuracy</h3>
                  <p className="text-4xl font-extrabold text-white">{Number(metrics.accuracy_rate).toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Spam vs Ham</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-slate-700/50 rounded">
                      <span className="text-slate-300">Spam Rate</span>
                      <span className="text-red-400 font-bold">{metrics.spam_percentage.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-700/50 rounded">
                      <span className="text-slate-300">Model Accuracy</span>
                      <span className="text-green-400 font-bold">{metrics.accuracy_rate.toFixed(2)}%</span>
                    </div>
                    <button onClick={loadMetrics} className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab - keeping original implementation */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {editingUser ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{editingUser === 'new' ? 'Create User' : 'Edit User'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {editingUser === 'new' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                          type="password"
                          value={editForm.password || ''}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})} className="w-4 h-4 rounded" />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={editForm.is_admin} onChange={(e) => setEditForm({...editForm, is_admin: e.target.checked})} className="w-4 h-4 rounded" />
                        Admin
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveEditUser} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                        Save
                      </button>
                      <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700 flex justify-between">
                    <h2 className="text-xl font-bold text-white">Users ({users.length})</h2>
                    <button 
                      onClick={() => {
                        setEditingUser('new')
                        setEditForm({ username: '', email: '', password: '', is_active: true, is_admin: false })
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                    >
                      Add User
                    </button>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-700/30">
                              <td className="px-6 py-4 text-sm text-slate-300">{u.id}</td>
                              <td className="px-6 py-4 text-sm font-medium text-white">{u.username}</td>
                              <td className="px-6 py-4 text-sm text-slate-300">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs rounded ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs rounded ${u.is_admin ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                  {u.is_admin ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm flex gap-2">
                                <button onClick={() => openEditUser(u)} title="Edit" className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => toggleUserStatus(u.id, u.is_active)} title="Toggle Status" className="p-2 hover:bg-slate-700 rounded text-yellow-400 hover:text-yellow-300">
                                  <Power size={16} />
                                </button>
                                {u.id !== user?.id && (
                                  <button onClick={() => deleteUser(u.id)} title="Delete" className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logs Tab - keeping original */}
          {activeTab === 'logs' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Spam Logs</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Result</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Confidence</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-sm text-slate-300">{log.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded ${log.result.toLowerCase().includes('spam') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">{(log.confidence * 100).toFixed(2)}%</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{new Date(log.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ENHANCED Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Total Feedback</h3>
                  <p className="text-3xl font-bold text-white">{feedback.length}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Misclassified</h3>
                  <p className="text-3xl font-bold text-red-400">{misclassifiedCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Used for retraining</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Correct Predictions</h3>
                  <p className="text-3xl font-bold text-green-400">{feedback.length - misclassifiedCount}</p>
                </div>
              </div>

              {/* Feedback Detail Modal */}
              {viewingFeedback && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-auto">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Feedback Details</h3>
                      <button onClick={() => setViewingFeedback(null)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-400">User</label>
                        <p className="text-white">{viewingFeedback.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Original Result</label>
                        <p className={`inline-block px-3 py-1 rounded text-sm ${viewingFeedback.original_result === 'spam' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {viewingFeedback.original_result}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Corrected Result</label>
                        <p className={`inline-block px-3 py-1 rounded text-sm ${viewingFeedback.corrected_result === 'spam' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {viewingFeedback.corrected_result}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Was Misclassified?</label>
                        <p className={`text-lg font-bold ${viewingFeedback.was_misclassified ? 'text-red-400' : 'text-green-400'}`}>
                          {viewingFeedback.was_misclassified ? 'Yes - Will be used for retraining' : 'No - Prediction was correct'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">User Comment</label>
                        <p className="text-white bg-slate-700/50 p-3 rounded">{viewingFeedback.comment || 'No comment provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Original Email Text</label>
                        <div className="text-white bg-slate-700/50 p-3 rounded max-h-60 overflow-auto whitespace-pre-wrap text-sm">
                          {viewingFeedback.email_text}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-400">Date</label>
                        <p className="text-slate-300">{new Date(viewingFeedback.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">User Feedback</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFeedbackFilter('all')}
                      className={`px-3 py-1 rounded text-sm transition ${feedbackFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      All ({feedback.length})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter('misclassified')}
                      className={`px-3 py-1 rounded text-sm transition ${feedbackFilter === 'misclassified' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Misclassified ({misclassifiedCount})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter('correct')}
                      className={`px-3 py-1 rounded text-sm transition ${feedbackFilter === 'correct' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Correct ({feedback.length - misclassifiedCount})
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : filteredFeedback.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No feedback yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">User</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Original</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Corrected</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {filteredFeedback.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-700/30">
                            <td className="px-6 py-4 text-sm text-slate-300">{f.username}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded ${f.original_result?.toLowerCase().includes('spam') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {f.original_result}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded ${f.corrected_result?.toLowerCase().includes('spam') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {f.corrected_result}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {f.was_misclassified ? (
                                <span className="flex items-center gap-1 text-xs text-orange-400">
                                  <AlertCircle size={14} />
                                  For Training
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                  <CheckCircle size={14} />
                                  Correct
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">{new Date(f.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm flex gap-2">
                              <button 
                                onClick={() => viewFeedbackDetails(f.id)} 
                                title="View Details" 
                                className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => deleteFeedback(f.id)} 
                                title="Delete" 
                                className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ENHANCED Model Tab */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Model Management</h2>
                <p className="text-slate-300 mb-6">Train and retrain the spam detection model</p>

                {retrainStatus ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">Feedback Collected</p>
                      <p className="text-3xl font-bold text-blue-400">{retrainStatus.feedback_count}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">Min Required</p>
                      <p className="text-3xl font-bold text-slate-300">{retrainStatus.min_required}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">Status</p>
                      <p className={`text-2xl font-bold ${retrainStatus.ready_to_retrain ? 'text-green-400' : 'text-yellow-400'}`}>
                        {retrainStatus.ready_to_retrain ? '✓ Ready' : '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading retrain status...</p>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/50 p-4 rounded mb-6">
                    <p className="text-red-400">Failed to load retrain status. Check console for errors.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={triggerInitialTrain}
                    disabled={retraining}
                    className={`py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      !retraining ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {retraining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Training...
                      </>
                    ) : (
                      <>
                        <Cpu size={20} />
                        Train Model
                      </>
                    )}
                  </button>

                  <button
                    onClick={triggerRetrain}
                    disabled={!retrainStatus?.ready_to_retrain || retraining}
                    className={`py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      retrainStatus?.ready_to_retrain && !retraining
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {retraining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Retraining...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Retrain Model
                      </>
                    )}
                  </button>
                </div>

                {retrainStatus && !retrainStatus.ready_to_retrain && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded mt-4">
                    <p className="text-yellow-400 flex items-center gap-2">
                      <AlertCircle size={18} />
                      {retrainStatus.message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Cpu className="text-blue-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Initial Training</h3>
                    </div>
                    <p className="text-sm text-slate-400">Trains model from scratch using the SMS Spam Collection dataset (5,574 samples). Use this if no model exists.</p>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Zap className="text-green-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Retraining</h3>
                    </div>
                    <p className="text-sm text-slate-400">Improves model using user feedback where predictions were wrong. Combines feedback with original dataset to prevent forgetting.</p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Clock className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Training Time</h3>
                  </div>
                  <p className="text-sm text-slate-400">Training typically takes 1-5 minutes depending on the dataset size. The page will update automatically when complete.</p>
                </div>
              </div>
            </div>
          )}

          {/* Cleanup Tab - Enhanced */}
          {activeTab === 'cleanup' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card-cyber rounded-xl shadow-2xl p-6 border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 p-3 rounded-lg border border-cyan-500/30">
                    <Trash2 className="h-6 w-6 text-cyan-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">System Cleanup</h2>
                    <p className="text-slate-400 text-sm">Clean up old logs and system data</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Quick Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => {
                        if (confirm('⚠️ Delete ALL logs immediately? This cannot be undone!')) {
                          deleteOldLogs(0)
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 text-red-300 border-2 border-red-500/50 hover:border-red-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete All Logs
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete logs older than 1 day?')) {
                          deleteOldLogs(1)
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-cyan-300 border-2 border-cyan-500/50 hover:border-cyan-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Logs Older Than 1 Day
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete logs older than 7 days?')) {
                          deleteOldLogs(7)
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-300 border-2 border-blue-500/50 hover:border-blue-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Logs Older Than 7 Days
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete logs older than 14 days?')) {
                          deleteOldLogs(14)
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border-2 border-purple-500/50 hover:border-purple-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Logs Older Than 14 Days
                    </button>
                  </div>

                  {/* Custom Days Input */}
                  <div className="border-t border-slate-700/50 pt-6">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Custom Deletion: Delete logs older than X days
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        id="customDays"
                        min="0"
                        placeholder="Enter days (0 = all logs)"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition backdrop-blur-sm font-mono"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('customDays')
                          const days = parseInt(input?.value || '0')
                          if (isNaN(days) || days < 0) {
                            showError?.('Please enter a valid number of days (0 or more)')
                            return
                          }
                          if (days === 0) {
                            if (confirm('⚠️ Delete ALL logs immediately? This cannot be undone!')) {
                              deleteOldLogs(0)
                              input.value = ''
                            }
                          } else {
                            if (confirm(`Delete logs older than ${days} days?`)) {
                              deleteOldLogs(days)
                              input.value = ''
                            }
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2 cyber-glow-hover btn-cyber"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Enter 0 to delete all logs. Warning: This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}