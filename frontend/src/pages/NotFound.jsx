import { Link } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-6 rounded-full border-4 border-red-500/50">
            <AlertCircle className="h-20 w-20 text-red-400" />
          </div>
        </div>
        <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mt-4">Page Not Found</h2>
        <p className="text-slate-400 mt-4 text-lg max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Home className="h-5 w-5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
