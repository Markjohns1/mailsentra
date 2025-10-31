import { useState } from 'react'
import { Mail, Send, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'
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

  const handleClear = () => {
    setEmailText('')
    setResult(null)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600/20 p-2 rounded-lg">
          <Mail className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Analyze Email</h2>
      </div>
      
      <textarea
        className="w-full h-48 p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        placeholder="Paste your email content here for spam detection analysis..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !emailText.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Analyze Email</span>
            </>
          )}
        </button>
        
        {(emailText || result) && (
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 bg-slate-700/50 border border-slate-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white">Analysis Result</h3>
          </div>
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            result.is_spam 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-green-500/20 border border-green-500/50'
          }`}>
            {result.is_spam ? (
              <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-bold text-xl capitalize mb-1 ${
                result.is_spam ? 'text-red-300' : 'text-green-300'
              }`}>
                {result.result}
              </p>
              <p className={`text-sm ${
                result.is_spam ? 'text-red-400' : 'text-green-400'
              }`}>
                Confidence: {(result.confidence * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-300">{result.message}</p>
        </div>
      )}
    </div>
  )
}

export default AnalyzeEmail
