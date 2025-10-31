import { useAuth } from '../context/AuthContext'
import Dashboard from '../components/dashboard/Dashboard'

const DashboardPage = () => {
  const { user } = useAuth()

  return <Dashboard user={user} />
}

export default DashboardPage
