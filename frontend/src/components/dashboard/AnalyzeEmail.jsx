import { useState } from 'react'
import { analyzeService } from '../../services/analyzeService'
import { useToast } from '../../context/ToastContext'

const AnalyzeEmail = ({ onAnalyzeComplete }) => {
  const [emailText, setEmailText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleAnalyze = async () => {
    if (!emailText.trim()) {
      showError('Please enter email text to analyze')
      return
    }

    setLoading(true)
    try {
      const response = await analyzeService.analyzeEmail(emailText)
      setResult(response)
      showSuccess(response.message)
      onAnalyzeComplete()
    } catch (error) {
      showError(error.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Analyze Email</h2>
      
      <textarea
        className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste email content here..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !emailText.trim()}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Email'}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="font-bold mb-2">Result:</h3>
          <div className={`p-3 rounded ${
            result.is_spam ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            <p className="font-bold text-lg capitalize">{result.result}</p>
            <p className="text-sm">Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">{result.message}</p>
        </div>
      )}
    </div>
  )
}

export default AnalyzeEmail

