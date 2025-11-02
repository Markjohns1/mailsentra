import { useState, useEffect } from 'react'
import { History, Filter, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react'
import { logsService } from '../../services/logsService'
import { feedbackService } from '../../services/feedbackService'
import { useToast } from '../../context/ToastContext'
import { formatters } from '../../utils/formatters'

const LogsTable = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [submitting, setSubmitting] = useState({})
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result_filter = filter === 'all' ? null : filter
      const data = await logsService.getLogs(10, 0, result_filter)
      setLogs(data)
    } catch (error) {
      showError('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (logId, correctedResult) => {
    setSubmitting({ ...submitting, [logId]: true })
    
    try {
      await feedbackService.submitFeedback(logId, correctedResult)
      showSuccess('Feedback submitted successfully! Thank you for helping improve our model.')
      loadLogs()
    } catch (error) {
      showError(error.response?.data?.detail || 'Failed to submit feedback')
    } finally {
      setSubmitting({ ...submitting, [logId]: false })
    }
  }

  return (
    <div className="card-cyber p-6 rounded-xl shadow-2xl animate-fade-in border-purple-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-3 rounded-lg border border-purple-500/30">
            <History className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Analysis</h2>
            <p className="text-sm text-slate-400">Activity log</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition backdrop-blur-sm"
          >
            <option value="all">All Results</option>
            <option value="spam">Spam Only</option>
            <option value="ham">Ham Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-cyan-500/30 border-t-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-slate-800/50 rounded-lg inline-block mb-4">
            <History className="h-16 w-16 text-slate-600 mx-auto" />
          </div>
          <p className="text-slate-400 text-lg font-medium">No logs found</p>
          <p className="text-slate-500 text-sm mt-2">Start analyzing emails to see results here</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="min-w-full">
            <thead className="bg-slate-900/50 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Result</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Confidence</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-all border-b border-slate-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      log.result.toLowerCase() === 'spam' 
                        ? 'bg-red-500/20 text-red-300 border-2 border-red-500/50 shadow-lg shadow-red-500/10' 
                        : 'bg-green-500/20 text-green-300 border-2 border-green-500/50 shadow-lg shadow-green-500/10'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                    {(log.confidence * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {formatters.date(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.is_correct === null ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(log.id, 'spam')}
                          disabled={submitting[log.id]}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            submitting[log.id]
                              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600'
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-2 border-red-500/50 hover:shadow-lg hover:shadow-red-500/20'
                          }`}
                          title="Report as spam if misclassified"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          {submitting[log.id] ? '...' : 'Spam'}
                        </button>
                        <button
                          onClick={() => handleFeedback(log.id, 'not spam')}
                          disabled={submitting[log.id]}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            submitting[log.id]
                              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600'
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border-2 border-green-500/50 hover:shadow-lg hover:shadow-green-500/20'
                          }`}
                          title="Report as not spam if misclassified"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          {submitting[log.id] ? '...' : 'Not Spam'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {log.is_correct ? 'Accurate' : 'Feedback received'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LogsTable
