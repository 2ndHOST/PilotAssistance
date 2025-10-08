import { AlertTriangle, X, Volume2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import TTSControls from './TTSControls'

const AlertsPanel = ({ alerts = [], compact = false, dense = false, fixedHeight = null, showTTS = false }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())
  const [muteAlerts, setMuteAlerts] = useState(false)

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
      case 'critical': return compact ? 'Critical' : 'Critical Alert'
      case 'caution': return compact ? 'Caution' : 'Caution Advisory'
      default: return compact ? 'Notice' : 'Weather Notice'
    }
  }

  const truncate = (str, len) => {
    if (!str) return ''
    const s = String(str)
    return s.length > len ? s.slice(0, len - 1) + '…' : s
  }

  const ttsText = useMemo(() => {
    if (!activeAlerts.length) return 'There are no active weather alerts.'
    const parts = activeAlerts.slice(0, 6).map(a => {
      const sev = a?.severity?.level || 'unknown'
      const icao = a?.icao || 'unknown'
      const cond = a?.conditions || a?.message || ''
      return `${sev} at ${icao}. ${truncate(cond.replace(/\s+/g, ' '), 80)}`
    })
    return `Active alerts: ${parts.join(' ')}.`
  }, [activeAlerts])

  const containerClasses = dense ? 'p-3' : (compact ? 'p-4' : 'p-6')
  const cardPadding = dense ? 'p-2' : (compact ? 'p-3' : 'p-4')
  const titleText = dense ? 'text-sm' : (compact ? 'text-base' : 'text-xl')
  const bodyText = dense ? 'text-[11px]' : (compact ? 'text-xs' : 'text-sm')

  return (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl ${containerClasses}`} style={fixedHeight ? { maxHeight: fixedHeight, overflowY: 'auto' } : {}}>
      <div className="flex items-center justify-between mb-2">
        <h2 className={`${titleText} font-semibold text-slate-900 flex items-center`}>
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
          Active Alerts
          {activeAlerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          {showTTS && (
            <TTSControls text={ttsText} size="small" />
          )}
          {activeAlerts.length > 0 && (
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
          )}
        </div>
      </div>

      <div className="space-y-2">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 opacity-30" />
            <p className="text-[11px]">No active weather alerts</p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.icao}
              className={`border rounded-lg ${cardPadding} ${getSeverityColor(alert.severity?.level || 'normal')} shadow-xs`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`flex items-center space-x-2 ${dense ? 'mb-0.5' : 'mb-1'}`}>
                    <span className={dense ? 'text-base' : 'text-lg'}>{alert.severity?.emoji || '⚠️'}</span>
                    <div>
                      <h3 className={`font-semibold ${dense ? 'text-[11px]' : 'text-xs'}`}>
                        {getSeverityTitle(alert.severity?.level || 'normal')}
                      </h3>
                      <p className="text-[10px] opacity-70">{alert.icao}</p>
                    </div>
                  </div>
                  
                  <p className={`${bodyText} leading-snug ${dense ? 'mb-0.5' : 'mb-1'}`}>
                    {truncate(alert.conditions || alert.message || 'No details available', dense ? 60 : (compact ? 90 : 160))}
                  </p>
                  
                  {!dense && (
                    <div className="flex items-center justify-between text-[10px] opacity-70">
                      <span>{alert.updated || ''}</span>
                      {alert.severity?.level === 'critical' && (
                        <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-medium">
                          IMMEDIATE ATTENTION
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => dismissAlert(alert.icao)}
                  className={`ml-2 ${dense ? 'p-0.5' : 'p-1'} hover:bg-black hover:bg-opacity-10 rounded transition-colors`}
                  title="Dismiss alert"
                >
                  <X className={dense ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeAlerts.length > 0 && !compact && !dense && (
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