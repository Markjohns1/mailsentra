import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Dashboard from '../components/dashboard/Dashboard'

const DashboardPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

export default DashboardPage

