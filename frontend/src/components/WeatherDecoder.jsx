import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cloud, Copy, Download, FileText, AlertCircle, CheckCircle, Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import weatherService from '../services/weatherService'
import WeatherCard from './WeatherCard'

const WeatherDecoder = ({ initialType = 'metar' }) => {
  const [input, setInput] = useState('')
  const [type, setType] = useState((initialType === 'taf' ? 'taf' : 'metar'))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDecode = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    try {
      const decoded = await weatherService.decodeWeather(input.trim(), type)
      setResult(decoded)
    } catch (error) {
      console.error('Failed to decode weather:', error)
      setResult({ 
        success: false, 
        error: error.message || 'Failed to decode weather data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result && result.success) {
      const textToCopy = result.decoded?.summary || 'No decoded text available'
      navigator.clipboard.writeText(textToCopy)
        .then(() => console.log('Copied to clipboard'))
        .catch(err => console.error('Failed to copy:', err))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Back to Weather Utils */}
      <div className="mb-2">
        <Link to="/weather-utils" className="inline-flex items-center text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Weather Utils
        </Link>
      </div>
      {/* Header Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-slate-800">
          Weather Decoder
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Decode raw METAR and TAF reports into plain English with our advanced aviation weather analysis tool.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg">
        <div className="p-8 space-y-8">
          {/* Report Type Selection */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-slate-800">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                type === 'metar' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}>
                <input
                  type="radio"
                  value="metar"
                  checked={type === 'metar'}
                  onChange={(e) => setType(e.target.value)}
                  className="sr-only"
                  aria-label="Select METAR report type"
                />
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5" />
                  <span className="font-medium">METAR</span>
                </div>
              </label>
              <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                type === 'taf' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}>
                <input
                  type="radio"
                  value="taf"
                  checked={type === 'taf'}
                  onChange={(e) => setType(e.target.value)}
                  className="sr-only"
                  aria-label="Select TAF report type"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">TAF</span>
                </div>
              </label>
            </div>
          </div>

          {/* Raw Text Input */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-slate-800">
              Raw {type.toUpperCase()} Text
            </label>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white transition-all duration-200 resize-none"
                placeholder={`Enter ${type.toUpperCase()} text here...`}
                aria-label={`Enter raw ${type.toUpperCase()} weather report text`}
                aria-describedby="textarea-help"
              />
            </div>
          </div>

          {/* Decode Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleDecode}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={loading ? 'Decoding weather report...' : 'Decode weather report'}
            >
              <div className="flex items-center space-x-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Decoding Weather...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-5 w-5" />
                    <span>Decode Weather</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Results Placeholder */}
      {!result && (
        <div className="text-center py-12">
          <Cloud className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Decoded weather information will appear here</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {result.success ? (
            <>
              {/* Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Decoded {result.type?.toUpperCase() || type.toUpperCase()}
                        </h2>
                        <p className="text-slate-500">Successfully processed weather report</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Copy decoded weather summary to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="font-medium">Copy Summary</span>
                    </button>
                  </div>
                  
                  {result.parsed && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span>Plain English Summary</span>
                      </h3>
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <p className="text-slate-700 leading-relaxed">
                          {result.decoded?.summary || 'No summary available'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {result.severity && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <span>Flight Conditions Assessment</span>
                      </h3>
                      <div className={`p-6 rounded-xl border ${
                        result.severity.level === 'critical' ? 'border-red-300 bg-red-50' :
                        result.severity.level === 'caution' ? 'border-yellow-300 bg-yellow-50' :
                        'border-green-300 bg-green-50'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <span className="text-3xl">{result.severity.emoji}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-2">{result.severity.description}</p>
                            {result.severity.reasons && result.severity.reasons.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-2">Key Concerns:</p>
                                <ul className="space-y-1">
                                  {result.severity.reasons.map((reason, index) => (
                                    <li key={index} className="text-sm flex items-center space-x-2">
                                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.raw && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Original Report</span>
                      </h3>
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                        <code>{result.raw}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed Weather Card */}
              {result.parsed && (
                <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                  <WeatherCard 
                    data={result}
                    loading={false}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-red-200 rounded-2xl shadow-lg">
              <div className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Decoding Error</h2>
                    <p className="text-red-700 mb-4">{result.error}</p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Please verify:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>The text is a valid {type.toUpperCase()} report</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>The ICAO airport code is correct</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>The format matches standard aviation weather reports</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {/* METAR Decoding Card */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8" />
            <h3 className="text-xl font-bold">METAR Decoding</h3>
          </div>
          <p className="text-white/90 leading-relaxed">
            Convert complex METAR reports into clear, understandable weather conditions
          </p>
        </div>

        {/* TAF Analysis Card */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">TAF Analysis</h3>
          </div>
          <p className="text-white/90 leading-relaxed">
            Decode Terminal Aerodrome Forecasts for comprehensive flight planning
          </p>
        </div>

        {/* Real-time Updates Card */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Real-time Updates</h3>
          </div>
          <p className="text-white/90 leading-relaxed">
            Get the latest weather data with our continuously updated aviation database
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeatherDecoder