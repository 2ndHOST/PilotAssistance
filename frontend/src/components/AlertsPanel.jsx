import { AlertTriangle, X, Volume2, Play, Pause } from 'lucide-react'
import { useState, useEffect } from 'react'

const AlertsPanel = ({ alerts = [] }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())
  const [muteAlerts, setMuteAlerts] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)

  // Ensure alerts is an array and filter out any invalid entries
  const validAlerts = Array.isArray(alerts) ? alerts.filter(alert => 
    alert && typeof alert === 'object' && alert.icao
  ) : []

  const activeAlerts = validAlerts.filter(alert => 
    alert && 
    alert.icao && 
    !dismissedAlerts.has(alert.icao) && 
    alert.severity && 
    alert.severity.level && 
    alert.severity.level !== 'normal'
  )

  const dismissAlert = (icao) => {
    setDismissedAlerts(prev => new Set([...prev, icao]))
  }

  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical': return 'border-red-300 bg-red-50 text-red-800'
      case 'caution': return 'border-yellow-300 bg-yellow-50 text-yellow-800'
      default: return 'border-gray-300 bg-gray-50 text-gray-800'
    }
  }

  const getSeverityTitle = (level) => {
    switch (level) {
      case 'critical': return 'Critical Alert'
      case 'caution': return 'Caution Advisory'
      default: return 'Weather Notice'
    }
  }

  const speakAlert = (alert) => {
    if (muteAlerts || !('speechSynthesis' in window)) return
    
    const utterance = new SpeechSynthesisUtterance()
    const alertText = `${getSeverityTitle(alert.severity?.level || 'normal')} for airport ${alert.icao}. ${alert.conditions || alert.message || 'No details available'}`
    
    utterance.text = alertText
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 0.8
    
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    
    speechSynthesis.speak(utterance)
  }

  const playAllAlerts = () => {
    if (activeAlerts.length === 0 || muteAlerts) return
    
    setIsPlaying(true)
    setCurrentAlertIndex(0)
    speakAlert(activeAlerts[0])
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 max-h-80 overflow-y-auto">
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10 pb-3">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
          Active Alerts
          {activeAlerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </h2>
        
        {activeAlerts.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={isPlaying ? stopSpeaking : playAllAlerts}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title={isPlaying ? 'Stop speaking' : 'Play alerts'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMuteAlerts(!muteAlerts)}
              className={`p-2 rounded-lg transition-colors ${
                muteAlerts 
                  ? 'bg-slate-200 text-slate-600' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
              title={muteAlerts ? 'Unmute alerts' : 'Mute alerts'}
            >
              <Volume2 className={`h-4 w-4 ${muteAlerts ? 'opacity-50' : ''}`} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active weather alerts</p>
            <p className="text-xs mt-1 opacity-70">All monitored airports show normal conditions</p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.icao}
              className={`border rounded-lg p-3 ${getSeverityColor(alert.severity?.level || 'normal')} shadow-xs`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{alert.severity?.emoji || '⚠️'}</span>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {getSeverityTitle(alert.severity?.level || 'normal')}
                      </h3>
                      <p className="text-xs opacity-70">Airport: {alert.icao}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-2">
                    {alert.conditions || alert.message || 'No details available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span>Updated {alert.updated || 'Unknown'}</span>
                    <div className="flex items-center space-x-2">
                      {alert.severity?.level === 'critical' && (
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-medium">
                          IMMEDIATE ATTENTION
                        </span>
                      )}
                      <button
                        onClick={() => speakAlert(alert)}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                        title="Speak this alert"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissAlert(alert.icao)}
                  className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                  title="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeAlerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setDismissedAlerts(new Set())}
              className="hover:text-slate-700 transition-colors"
            >
              Clear dismissed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertsPanel