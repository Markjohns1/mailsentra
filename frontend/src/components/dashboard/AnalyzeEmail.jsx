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
    <div className="card-cyber p-6 rounded-xl shadow-2xl animate-fade-in border-cyan-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-lg border border-cyan-500/30">
          <Mail className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Threat Analysis</h2>
          <p className="text-sm text-slate-400">Email content scanner</p>
        </div>
      </div>
      
      <textarea
        className="w-full h-48 p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition resize-none font-mono text-sm backdrop-blur-sm"
        placeholder="Paste email content for AI-powered spam detection analysis..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !emailText.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cyber-glow-hover btn-cyber"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
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
            className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg font-semibold transition-all border border-slate-700 hover:border-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 bg-slate-900/70 backdrop-blur-sm border rounded-xl p-5 animate-fade-in border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-white text-lg">Analysis Result</h3>
          </div>
          <div className={`p-5 rounded-lg flex items-center gap-4 border-2 ${
            result.is_spam 
              ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20' 
              : 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
          }`}>
            {result.is_spam ? (
              <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
              </div>
            ) : (
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
              </div>
            )}
            <div className="flex-1">
              <p className={`font-extrabold text-2xl capitalize mb-2 ${
                result.is_spam ? 'text-red-300' : 'text-green-300'
              }`}>
                {result.result.toUpperCase()}
              </p>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  result.is_spam ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                }`}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Model v{result.model_version || '1.0'}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            {result.message}
          </p>
        </div>
      )}
    </div>
  )
}

export default AnalyzeEmail
