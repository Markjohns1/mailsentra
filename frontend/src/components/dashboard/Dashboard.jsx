import { useState, useEffect } from 'react'
import { BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="text-gray-600 mt-2">Analyze emails for spam detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Analyses"
          value={stats.total_analyses}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Spam Detected"
          value={stats.spam_detected}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          title="Ham Detected"
          value={stats.ham_detected}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyzeEmail onAnalyzeComplete={onAnalyzeComplete} />
        <LogsTable />
      </div>
    </div>
  )
}

export default Dashboard