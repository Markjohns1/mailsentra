import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_BASE_URL } from '../utils/constants'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Menu, X, AlertCircle, CheckCircle, Clock, Zap, Trash2, Edit2, Power, LogOut } from 'lucide-react'
import { LayoutDashboard, Users, FileText, MessageSquare, Cpu } from 'lucide-react';

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
      const res = await fetch(`${API_BASE_URL}/admin/retrain/status`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load retrain status')
      const data = await res.json()
      setRetrainStatus(data)
    } catch (e) {
      showError?.(String(e))
    } finally {
      setLoading(false)
    }
  }

  const triggerRetrain = async () => {
    setRetraining(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/retrain`, {
        method: 'POST',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Retraining failed')
      const data = await res.json()
      showSuccess?.(`Model retrained - Accuracy: ${(data.training_stats.accuracy * 100).toFixed(2)}%`)
      loadRetrainStatus()
    } catch (e) {
      showError?.(String(e))
    } finally {
      setRetraining(false)
    }
  }

  const triggerInitialTrain = async () => {
    setRetraining(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/train`, {
        method: 'POST',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Training failed')
      const data = await res.json()
      showSuccess?.(`Model trained - Accuracy: ${(data.training_stats.accuracy * 100).toFixed(2)}%`)
      loadRetrainStatus()
      loadMetrics()
    } catch (e) {
      showError?.(String(e))
    } finally {
      setRetraining(false)
    }
  }

  const deleteOldLogs = async (daysOld) => {
    if (!confirm(`Delete all logs older than ${daysOld} days?`)) return
    setRetraining(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bulk/delete-old-logs?days_old=${daysOld}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Deletion failed')
      const data = await res.json()
      showSuccess?.(`Deleted ${data.message}`)
      loadMetrics()
    } catch (e) {
      showError?.(String(e))
    } finally {
      setRetraining(false)
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
];

  const chartData = [
    { name: 'Spam', value: metrics?.spam_detected || 0 },
    { name: 'Ham', value: (metrics?.total_scans || 0) - (metrics?.spam_detected || 0) }
  ]

  const COLORS = ['#ef4444', '#10b981']

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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-white">MailSentra</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">System monitoring and management</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && metrics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-xl border border-blue-500/50">
                  <h3 className="text-sm font-medium text-blue-100 mb-2">Total Scans</h3>
                  <p className="text-3xl font-bold text-white">{metrics.total_scans.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-xl shadow-xl border border-red-500/50">
                  <h3 className="text-sm font-medium text-red-100 mb-2">Spam Detected</h3>
                  <p className="text-3xl font-bold text-white">{metrics.spam_detected.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-xl border border-green-500/50">
                  <h3 className="text-sm font-medium text-green-100 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{metrics.total_users.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-xl border border-purple-500/50">
                  <h3 className="text-sm font-medium text-purple-100 mb-2">Accuracy</h3>
                  <p className="text-3xl font-bold text-white">{Number(metrics.accuracy_rate).toFixed(2)}%</p>
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

          {/* Users Tab */}
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
  <span
    className={`px-3 py-1 text-xs rounded ${
      u.is_admin
        ? "bg-blue-500/20 text-blue-400"
        : "bg-slate-500/20 text-slate-400"
    }`}
  >
    {u.is_admin ? "Admin" : "User"}
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

          {/* Logs Tab */}
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

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">User Feedback</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
                </div>
              ) : feedback.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No feedback yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Original</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Corrected</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {feedback.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-sm text-slate-300">{f.username}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{f.original_result}</td>
                          <td className="px-6 py-4 text-sm font-medium text-white">{f.corrected_result}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{f.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Model Tab */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Model Management</h2>
                <p className="text-slate-300 mb-6">Train and retrain the spam detection model</p>

                {retrainStatus && (
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
                        {retrainStatus.ready_to_retrain ? 'Ready' : 'Pending'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
  onClick={triggerInitialTrain}
  disabled={retraining}
  className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
    !retraining ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
  }`}
>
  {retraining ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <Cpu size={20} />}
  Train Model
</button>
                  {}
                  <button
  onClick={triggerRetrain}
  disabled={!retrainStatus?.ready_to_retrain || retraining}
  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
    retrainStatus?.ready_to_retrain && !retraining
      ? 'bg-green-600 hover:bg-green-700 text-white'
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
      <Cpu size={20} />
      Retrain Model
    </>
  )}
</button>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Clock className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Time</h3>
                  </div>
                  <p className="text-sm text-slate-400">Training typically takes 1-5 minutes depending on the dataset size.</p>
                </div>
              </div>
            </div>
          )}

          {/* Cleanup Tab */}
          {activeTab === 'cleanup' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Cleanup</h2>
              <p className="text-slate-300 mb-6">Clean up old logs and system data</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => deleteOldLogs(30)}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Delete Logs Older Than 30 Days
                </button>
                <button
                  onClick={() => deleteOldLogs(90)}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
                >
                  Delete Logs Older Than 90 Days
                </button>
                <button
                  onClick={() => deleteOldLogs(365)}
                  className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition"
                >
                  Delete Logs Older Than 1 Year
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {}
    </div>
  )
}