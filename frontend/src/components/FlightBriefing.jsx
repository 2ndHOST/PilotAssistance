import { useState } from 'react'
import { Plane, MapPin, AlertTriangle, Download } from 'lucide-react'
import weatherService from '../services/weatherService'
import WeatherCard from './WeatherCard'
import FlightMap from './FlightMap'
import AlertsPanel from './AlertsPanel'
import TTSControls from './TTSControls'
const FlightBriefing = () => {
  const [briefingData, setBriefingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState({
    origin: '',
    destination: '',
    alternates: [''],
    flightLevel: 'FL350'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const briefing = await weatherService.getFlightBriefing(route)
      setBriefingData(briefing)
    } catch (error) {
      console.error('Failed to generate briefing:', error)
      // Show error to user
      setBriefingData({
        error: error.message || 'Failed to generate flight briefing'
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'caution': return 'text-yellow-600 bg-yellow-50'
      case 'normal': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Flight Briefing
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get comprehensive weather briefings and flight planning assistance for your route
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 overflow-hidden">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Flight Route Planning</h2>
              <p className="text-slate-600 text-sm">Enter your flight details to get started</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 px-2 sm:px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-8 md:gap-x-10 lg:gap-x-12">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Origin Airport
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={route.origin}
                      onChange={(e) => setRoute({...route, origin: e.target.value.toUpperCase()})}
                      className="w-full max-w-sm h-12 px-4 text-base font-medium bg-white/80 border-2 border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                      placeholder="KJFK"
                      maxLength={4}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">ICAO</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Destination Airport
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={route.destination}
                      onChange={(e) => setRoute({...route, destination: e.target.value.toUpperCase()})}
                      className="w-full max-w-sm h-12 px-4 text-base font-medium bg-white/80 border-2 border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                      placeholder="KLAX"
                      maxLength={4}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">ICAO</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Flight Level
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={route.flightLevel || ''}
                      onChange={(e) => setRoute({...route, flightLevel: e.target.value.toUpperCase()})}
                      className="w-full max-w-sm h-12 px-4 text-base font-medium bg-white/80 border-2 border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                      placeholder="FL350"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Alternate Airport <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={route.alternates[0]}
                    onChange={(e) => setRoute({...route, alternates: [e.target.value.toUpperCase()]})}
                    className="w-full max-w-sm h-12 px-4 text-base font-medium bg-white/80 border-2 border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                    placeholder="KORD"
                    maxLength={4}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">ICAO</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !route.origin || !route.destination}
                  className="w-full h-12 text-base font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Briefing...
                      </>
                    ) : (
                      <>
                        <Plane className="h-4 w-4 mr-2" />
                        Get Flight Briefing
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Briefing Results */}
        {briefingData && (
          <div className="mt-8 space-y-6">
            {briefingData.error ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-50/80 backdrop-blur-xl rounded-3xl shadow-xl border border-red-200/50 p-8">
                  <div className="flex items-center space-x-3 text-red-700 mb-4">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold">Error Loading Briefing</h2>
                  </div>
                  <p className="text-red-600 text-lg">{briefingData.error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Briefing Summary */}
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-5">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Flight Briefing Summary</h2>
                      </div>
                      <div className="flex items-center space-x-4">
                        <TTSControls 
                          briefingData={briefingData}
                          size="small"
                          className="relative"
                        />
                        <span className={`px-4 py-2 rounded-2xl text-sm font-bold ${getSeverityColor(briefingData.summary?.worstSeverity)}`}>
                          {briefingData.summary?.worstSeverity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Route Information</h3>
                        <p className="text-slate-700">
                          <span className="font-medium">From:</span> {briefingData.route?.origin} 
                          <span className="mx-2">→</span>
                          <span className="font-medium">To:</span> {briefingData.route?.destination}
                        </p>
                        {(briefingData.route?.flightLevel || briefingData.route?.flightLevelFt) && (
                          <p className="text-slate-600 text-sm mt-1">
                            Flight Level: {briefingData.route.flightLevel || '—'}{briefingData.route.flightLevelFt ? ` (${briefingData.route.flightLevelFt.toLocaleString()} ft)` : ''}
                          </p>
                        )}
                        {briefingData.route?.alternates && briefingData.route.alternates.length > 0 && (
                          <p className="text-slate-600 text-sm mt-1">
                            <span className="font-medium">Alternates:</span> {briefingData.route.alternates.join(', ')}
                          </p>
                        )}
                      </div>
                      
                      {briefingData.summary?.recommendations && briefingData.summary.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Recommendations</h3>
                          <ul className="space-y-1">
                            {briefingData.summary.recommendations.map((rec, index) => (
                              <li key={index} className="text-slate-700 text-sm flex items-start">
                                <span className="text-aviation-600 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {briefingData.voiceBriefing && (
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Voice Briefing Summary</h3>
                          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                            <p><strong>Duration:</strong> ~{briefingData.voiceBriefing.duration} seconds</p>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-aviation-600 hover:text-aviation-700">Show briefing text</summary>
                              <div className="mt-2 text-xs bg-white p-2 rounded border">
                                {briefingData.voiceBriefing.text}
                              </div>
                            </details>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <AlertsPanel 
                      alerts={briefingData.summary?.criticalAlerts || []}
                    />
                  </div>
                </div>
                  </div>
                </div>
              
                {/* Airport Weather Details */}
                {briefingData.airports && Object.keys(briefingData.airports).length > 0 && (
                  <div className="max-w-6xl mx-auto mt-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Airport Weather Details</h2>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(briefingData.airports).map(([icao, data]) => (
                          <div key={icao} className="bg-white/50 rounded-xl p-4 border border-white/30">
                            <h3 className="text-base font-semibold mb-2 flex items-center">
                              {icao}
                              <span className="ml-3 text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-xl font-medium">
                                {data.role}
                              </span>
                            </h3>
                            {data.airport && (
                              <div className="text-slate-600 text-xs mb-3 space-y-1">
                                <p>
                                  {data.airport.name || 'Unknown'}{data.airport.country ? ` • ${data.airport.country}` : ''}
                                  {data.airport.lat != null && data.airport.lon != null ? ` • ${Number(data.airport.lat).toFixed ? Number(data.airport.lat).toFixed(3) : data.airport.lat}, ${Number(data.airport.lon).toFixed ? Number(data.airport.lon).toFixed(3) : data.airport.lon}` : ''}
                                </p>
                                {data.airport.elevationFt != null && (
                                  <p className="text-slate-500">Elevation: {Number(data.airport.elevationFt).toLocaleString()} ft</p>
                                )}
                              </div>
                            )}
                            {data.metar && (
                              <WeatherCard 
                                data={data.metar}
                                loading={false}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Enroute Weather */}
                {briefingData.routeWeather && Array.isArray(briefingData.routeWeather.points) && (
                  <div className="max-w-6xl mx-auto mt-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-5">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Enroute Weather {briefingData.route?.flightLevel ? `(at ${briefingData.route.flightLevel})` : ''}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {briefingData.routeWeather.points.map((pt, idx) => (
                          <div key={idx} className="bg-white/50 rounded-xl p-4 border border-white/30">
                            <div className="text-slate-700 text-sm mb-1">
                              Point {idx + 1} • {pt.lat != null && pt.lon != null ? `${Number(pt.lat).toFixed ? Number(pt.lat).toFixed(2) : pt.lat}, ${Number(pt.lon).toFixed ? Number(pt.lon).toFixed(2) : pt.lon}` : 'N/A'}
                            </div>
                            {pt.nearestStation && (
                              <div className="text-slate-600 text-xs mb-1">
                                Nearest: {pt.nearestStation}{pt.distanceNm ? ` • ${Number(pt.distanceNm).toFixed ? Number(pt.distanceNm).toFixed(1) : pt.distanceNm} NM` : ''}
                              </div>
                            )}
                            {pt.metarSummary ? (
                              <div className={`text-xs rounded-lg p-3 ${getSeverityColor(pt.metar?.severity?.level)}`}>
                                {pt.metarSummary}
                                {pt.altitudeFt != null && (
                                  <div className="mt-1 text-[10px] text-slate-600">Altitude: {Number(pt.altitudeFt).toLocaleString()} ft</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No data</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Flight Map */}
                <div className="max-w-6xl mx-auto mt-8">
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-5">
                    <FlightMap 
                      route={briefingData.route}
                      airports={Object.entries(briefingData.airports || {}).map(([icao, data]) => ({
                        icao,
                        severity: data.metar?.severity || { level: 'unknown' },
                        conditions: data.metar?.decoded?.summary || 'No data',
                        lat: data.airport?.lat,
                        lon: data.airport?.lon
                      }))}
                      enroutePoints={briefingData.routeWeather?.points || []}
                      height="500px"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlightBriefing