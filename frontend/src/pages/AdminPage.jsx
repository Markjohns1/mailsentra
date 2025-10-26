import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const AdminPage = () => {
  const { user } = useAuth()
  const { showError } = useToast()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      // In production, this would call the metrics API
      setMetrics({
        total_scans: 0,
        spam_detected: 0,
        total_users: 0,
        accuracy_rate: 0
      })
    } catch (error) {
      showError('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System monitoring and analytics</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Scans</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.total_scans.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Spam Detected</h3>
            <p className="text-3xl font-bold text-red-600">{metrics.spam_detected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.total_users.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Accuracy</h3>
            <p className="text-3xl font-bold text-purple-600">{metrics.accuracy_rate.toFixed(2)}%</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">System Statistics</h2>
        <p className="text-gray-600">Admin metrics and monitoring tools available via API endpoints.</p>
      </div>
    </div>
  )
}

export default AdminPage

