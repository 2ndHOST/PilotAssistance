
import { useState, useEffect, useRef } from 'react'
import { Plane, CloudRain, AlertTriangle, Clock, MapPin, Wind, Search, X } from 'lucide-react'
import WeatherCard from './WeatherCard'
import FlightMap from './FlightMap'
import AlertsPanel from './AlertsPanel'
import TTSControls from './TTSControls'
import weatherService from '../services/weatherService'

const Dashboard = () => {
  const [recentFlights, setRecentFlights] = useState([])
  const [quickWeather, setQuickWeather] = useState([])
  const [currentFlight, setCurrentFlight] = useState(null)
  const [altitudeWeather, setAltitudeWeather] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [flightSearchTerm, setFlightSearchTerm] = useState('')
  const [showFlightSearch, setShowFlightSearch] = useState(false)

  useEffect(() => {
    let timer
    const seededRef = seededRefOuter.current
    const load = async () => {
      try {
        // Try fetching current & recent first
        let [current, recent] = await Promise.all([
          weatherService.getCurrentFlight(),
          weatherService.getRecentFlights()
        ])

        // If no current flight yet, seed demo ONCE then refetch
        if ((!current?.success || !current?.departure) && !seededRefOuter.current) {
          try {
            await weatherService.getDemoBriefing()
            seededRefOuter.current = true
            current = await weatherService.getCurrentFlight()
            recent = await weatherService.getRecentFlights()
          } catch {}
        }

        if (current?.success) {
          setCurrentFlight(current)
          
          // Set altitude weather data from current flight
          setAltitudeWeather(current.altitudeWeather || [])
        }
        
        if (recent?.success) {
          const flights = (recent.flights || []).map((f, idx) => ({
            id: f.id || `${idx}`,
            origin: f.departure,
            destination: f.destination,
            time: formatTimeAgo(f.timestamp),
            status: f.status || 'completed'
          }))
          setRecentFlights(flights)
        }

        // For map severity markers, use routeAirports when available
        if (current?.routeAirports) {
          const airports = current.routeAirports.map(a => ({
            icao: a.icao,
            lat: a.lat,
            lon: a.lon,
            conditions: a.conditions,
            severity: a.severity
          }))
          setQuickWeather(airports)
        }
      } catch (e) {
        console.error('Failed to load flight data', e)
      } finally {
        setLastUpdated(new Date())
        setLoading(false)
      }
    }

    load()
    timer = setInterval(load, 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  // local ref to avoid reseeding demo repeatedly
  const seededRefOuter = useRef(false)

  const formatTimeAgo = (ts) => {
    if (!ts) return '—'
    const diffMs = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hours ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }


  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'caution': return 'text-yellow-600 bg-yellow-50'
      case 'normal': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Filter flights based on search term
  const filteredFlights = recentFlights.filter(flight => {
    if (!flightSearchTerm) return true
    const searchLower = flightSearchTerm.toLowerCase()
    return (
      flight.origin.toLowerCase().includes(searchLower) ||
      flight.destination.toLowerCase().includes(searchLower) ||
      flight.status.toLowerCase().includes(searchLower) ||
      flight.time.toLowerCase().includes(searchLower)
    )
  })

  // Show at most three entries
  const displayedFlights = filteredFlights.slice(0, 3)

  const clearSearch = () => {
    setFlightSearchTerm('')
    setShowFlightSearch(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-slate-600">Loading dashboard...</span>
      </div>
    )
  }

  const minutesAgo = Math.max(0, Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000))

  const departureIcao = currentFlight?.departure || '—'
  const destinationIcao = currentFlight?.destination || '—'
  const plannedFlightTime = currentFlight?.flightTime || '—'
  const plannedDistance = (currentFlight?.distanceKm != null) ? `${currentFlight.distanceKm} km` : '—'

  return (
    <div className="space-y-6 bg-[#F8F9FB] pt-6">
      {/* Header with Stats in One Line */}
      <div className="flex items-center justify-between gap-6">
        {/* Pilot Dashboard Title */}
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900">Pilot Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Weather conditions and flight planning tools
          </p>
        </div>

        {/* Quick Summary Cards (Flight Briefing Top) */}
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-aviation-100 rounded-lg">
                  <Plane className="h-5 w-5 text-aviation-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Departure</p>
                  <p className="text-xl font-bold text-slate-900">{departureIcao}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Destination</p>
                  <p className="text-xl font-bold text-slate-900">{destinationIcao}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Flight Time</p>
                <p className="text-xl font-bold text-slate-900">{plannedFlightTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Distance</p>
                <p className="text-xl font-bold text-slate-900">{plannedDistance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm text-slate-500">Last updated</div>
          <div className="text-lg font-semibold text-slate-900">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Map + Right Sidebar (Alerts + Flight Plan Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Central Map */}
        <div className="lg:col-span-2 relative z-10">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 relative">
            <FlightMap 
              route={{ origin: departureIcao, destination: destinationIcao, alternates: [] }}
              airports={quickWeather}
              height="360px"
            />
            <div className="mt-2 text-xs text-slate-500">Updated {minutesAgo} min ago</div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Weather Alerts Along Route */}
          <AlertsPanel 
            alerts={quickWeather
              .filter(w => w.severity && w.severity.level && w.severity.level !== 'normal')
              .map(w => ({
                icao: w.icao,
                severity: w.severity,
                conditions: w.conditions,
                updated: w.updated
              }))
            }
          />

          {/* Flight Plan Details Sidebar */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-slate-600" />
                Flight Plan Details
              </h2>
              <button
                onClick={() => setShowFlightSearch(!showFlightSearch)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {showFlightSearch && (
              <div className="mb-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search flights by origin, destination, status, or time..."
                    value={flightSearchTerm}
                    onChange={(e) => setFlightSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-aviation-500 focus:border-aviation-500 text-sm"
                  />
                  {flightSearchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {flightSearchTerm && (
                  <div className="mt-2 text-sm text-slate-500">
                    {filteredFlights.length} of {recentFlights.length} flights found
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500 mb-2">Updated {minutesAgo} min ago</div>
            <div className="space-y-3">
              {displayedFlights.length > 0 ? (
                displayedFlights.map((flight) => (
                  <div key={flight.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <Plane className="h-4 w-4 text-slate-500" />
                      <div>
                        <span className="font-medium">{flight.origin} → {flight.destination}</span>
                        <div className="text-xs text-slate-500 capitalize">{flight.status}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">{flight.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Plane className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">
                    {flightSearchTerm ? 'No flights found matching your search' : 'No recent flights'}
                  </p>
                  {flightSearchTerm && (
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-xs text-aviation-600 hover:text-aviation-700 underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacing between sections */}
      <div className="h-8"></div>

      {/* Flight Route Weather Summary */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 sticky top-0 bg-white z-10 pb-4">Flight Route Weather Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Departure','Enroute','Arrival'].map((label, idx) => {
            const w = quickWeather[idx] || quickWeather[0] || { icao: '—', conditions: '—', severity: { level: 'unknown', emoji: '⚪' }, updated: '—' }
            return (
              <div key={label} className={`p-4 rounded-lg border ${getSeverityColor(w.severity.level)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-700">{label}</div>
                  <div className="text-xs text-slate-500">{w.updated}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{w.severity.emoji}</span>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{w.icao}</div>
                    <div className="text-sm text-slate-600">{w.conditions}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Altitude Layer Weather */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Altitude Layer Weather</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {altitudeWeather.length > 0 ? altitudeWeather.map((alt, i) => (
            <div key={alt.level} className="p-4 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-700">{alt.level}</div>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  alt.severity === 'critical' ? 'bg-red-500' :
                  alt.severity === 'caution' ? 'bg-yellow-400' :
                  alt.severity === 'normal' ? 'bg-green-500' : 'bg-slate-300'
                }`}></span>
              </div>
              <div className="text-sm text-slate-600">
                Temp: {alt.temperature}°C
              </div>
              <div className="text-sm text-slate-600">
                Wind: {alt.wind}
              </div>
              <div className="text-sm text-slate-600">
                Conditions: {alt.conditions}
              </div>
              <div className="text-sm text-slate-600">
                Turbulence: {alt.turbulence}
              </div>
            </div>
          )) : ['FL180','FL240','FL300','FL360'].map((level, i) => (
            <div key={level} className="p-4 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-700">{level}</div>
                <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
              </div>
              <div className="text-sm text-slate-600">
                Temp: —°C
              </div>
              <div className="text-sm text-slate-600">
                Wind: — kt
              </div>
              <div className="text-sm text-slate-600">
                Conditions: —
              </div>
              <div className="text-sm text-slate-600">
                Turbulence: —
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard