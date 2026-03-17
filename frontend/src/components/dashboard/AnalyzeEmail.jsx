import { useState } from 'react'
import { Mail, AlertTriangle, CheckCircle, HelpCircle, Sparkles } from 'lucide-react'
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

  const getResultStyle = () => {
    if (!result) return {}
    if (result.result === 'uncertain') return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/20', text: 'text-yellow-300', badgeBg: 'bg-yellow-500/20' }
    if (result.is_spam) return { bg: 'bg-red-500/10', border: 'border-red-500/50', shadow: 'shadow-red-500/20', text: 'text-red-300', badgeBg: 'bg-red-500/20' }
    return { bg: 'bg-green-500/10', border: 'border-green-500/50', shadow: 'shadow-green-500/20', text: 'text-green-300', badgeBg: 'bg-green-500/20' }
  }

  const getResultIcon = () => {
    if (!result) return null
    if (result.result === 'uncertain') return <HelpCircle className="h-7 w-7 text-yellow-400" />
    if (result.is_spam) return <AlertTriangle className="h-7 w-7 text-red-400" />
    return <CheckCircle className="h-7 w-7 text-green-400" />
  }

  const style = getResultStyle()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Input */}
      <div className="card-cyber p-5 rounded-lg border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Analyze Email</h2>
        </div>

        <textarea
          className="w-full h-52 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition resize-none font-mono text-xs backdrop-blur-sm"
          placeholder="Paste email content here..."
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !emailText.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze</span>
              </>
            )}
          </button>

          {(emailText || result) && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg text-sm font-semibold transition-all border border-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Result */}
      <div className="card-cyber p-5 rounded-lg border-slate-700/50 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Result</h2>
        </div>

        {result ? (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className={`p-4 rounded-lg flex items-center gap-3 border-2 ${style.bg} ${style.border} shadow-lg ${style.shadow}`}>
              <div className={`p-2.5 ${style.badgeBg} rounded-lg border ${style.border}`}>
                {getResultIcon()}
              </div>
              <div className="flex-1">
                <p className={`font-extrabold text-xl capitalize ${style.text}`}>
                  {result.result.toUpperCase()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badgeBg} ${style.text}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    v{result.model_version || '1.0'}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              {result.message}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Paste an email and click Analyze</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyzeEmail
