import { useState, useEffect } from 'react'
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import AnalyzeEmail from './AnalyzeEmail'
import LogsTable from './LogsTable'
import StatsCard from './StatsCard'
import { logsService } from '../../services/logsService'
import { useToast } from '../../context/ToastContext'

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    total_analyses: 0,
    spam_detected: 0,
    ham_detected: 0,
    accuracy_rate: 0,
  })
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await logsService.getStats()
      setStats(data)
    } catch (error) {
      showError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const onAnalyzeComplete = () => {
    loadStats()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">{user?.username}</span>!
          </h1>
          <p className="text-slate-400 text-lg">Protect your inbox with AI-powered spam detection</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Analyses"
                value={stats.total_analyses}
                icon={<BarChart3 className="w-10 h-10" />}
                color="blue"
              />
              <StatsCard
                title="Spam Detected"
                value={stats.spam_detected}
                icon={<AlertTriangle className="w-10 h-10" />}
                color="red"
              />
              <StatsCard
                title="Ham Detected"
                value={stats.ham_detected}
                icon={<CheckCircle className="w-10 h-10" />}
                color="green"
              />
              <StatsCard
                title="Accuracy Rate"
                value={`${stats.accuracy_rate.toFixed(1)}%`}
                icon={<TrendingUp className="w-10 h-10" />}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyzeEmail onAnalyzeComplete={onAnalyzeComplete} />
              <LogsTable />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
