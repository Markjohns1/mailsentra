import { useState, useEffect } from 'react'
import { logsService } from '../../services/logsService'
import { feedbackService } from '../../services/feedbackService'
import { useToast } from '../../context/ToastContext'
import { formatters } from '../../utils/formatters'

const LogsTable = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [submitting, setSubmitting] = useState({})
  const { showError, showSuccess, showInfo } = useToast()

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
      // Reload logs to show updated feedback status
      loadLogs()
    } catch (error) {
      showError(error.response?.data?.detail || 'Failed to submit feedback')
    } finally {
      setSubmitting({ ...submitting, [logId]: false })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Logs</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All</option>
          <option value="spam">Spam</option>
          <option value="ham">Ham</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No logs found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.result.toLowerCase() === 'spam' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {(log.confidence * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatters.date(log.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {log.is_correct === null ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(log.id, 'spam')}
                          disabled={submitting[log.id]}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            submitting[log.id]
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title="Mark this as spam if misclassified"
                        >
                          {submitting[log.id] ? '...' : 'Report Spam'}
                        </button>
                        <button
                          onClick={() => handleFeedback(log.id, 'not spam')}
                          disabled={submitting[log.id]}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            submitting[log.id]
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title="Mark this as not spam if misclassified"
                        >
                          {submitting[log.id] ? '...' : 'Report Not Spam'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        {log.is_correct ? '✓ Accurate' : 'Feedback received'}
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

