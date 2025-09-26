
import { useState, useEffect } from 'react'
import { Plane, CloudRain, AlertTriangle, Clock, MapPin, Wind, Search, X } from 'lucide-react'
import WeatherCard from './WeatherCard'
import FlightMap from './FlightMap'
import AlertsPanel from './AlertsPanel'
import TTSControls from './TTSControls'
import weatherService from '../services/weatherService'

const Dashboard = () => {
  const [recentFlights, setRecentFlights] = useState([])
  const [quickWeather, setQuickWeather] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [flightSearchTerm, setFlightSearchTerm] = useState('')
  const [showFlightSearch, setShowFlightSearch] = useState(false)

  // Sample data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Check API health first
        await weatherService.checkHealth()
        
        // Load demo briefing data
        const demoBriefing = await weatherService.getDemoBriefing()
        
        setRecentFlights([
          { id: 1, origin: 'KJFK', destination: 'KLAX', time: '2 hours ago', status: 'completed' },
          { id: 2, origin: 'KORD', destination: 'KDEN', time: '5 hours ago', status: 'completed' },
          { id: 3, origin: 'KBOS', destination: 'KSEA', time: '1 day ago', status: 'completed' },
        ])
        
        // Load quick weather for diverse airports to show different conditions
        const airports = ['KJFK', 'KBOS', 'KORD']
        const weatherPromises = airports.map(async (icao) => {
          try {
            const metar = await weatherService.getMetar(icao)
            return {
              icao,
              conditions: metar.success ? metar.decoded.summary : 'Data unavailable',
              severity: metar.success ? metar.severity : { level: 'unknown', emoji: '⚪' },
              updated: metar.success ? 'Just now' : 'Unknown'
            }
          } catch (error) {
            console.error(`Failed to load weather for ${icao}:`, error)
            return {
              icao,
              conditions: 'Unable to load weather data',
              severity: { level: 'unknown', emoji: '⚪' },
              updated: 'Error'
            }
          }
        })
        
        const weatherData = await Promise.all(weatherPromises)
        setQuickWeather(weatherData)
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Fallback to mock data
        setRecentFlights([
          { id: 1, origin: 'KJFK', destination: 'KLAX', time: '2 hours ago', status: 'completed' },
          { id: 2, origin: 'KORD', destination: 'KDEN', time: '5 hours ago', status: 'completed' },
          { id: 3, origin: 'KBOS', destination: 'KSEA', time: '1 day ago', status: 'completed' },
        ])
        
        setQuickWeather([
          { 
            icao: 'KJFK', 
            conditions: 'Wind 280° at 14G20kt, 10SM visibility, Few clouds at 25000ft',
            severity: { level: 'normal', emoji: '🟢' },
            updated: '5 min ago'
          },
          { 
            icao: 'KBOS', 
            conditions: 'Fog, 1/4SM visibility, Overcast at 200ft',
            severity: { level: 'critical', emoji: '🔴' },
            updated: '3 min ago'
          },
          { 
            icao: 'KORD', 
            conditions: 'Thunderstorms, 1/2SM visibility, Heavy rain',
            severity: { level: 'critical', emoji: '🔴' },
            updated: '1 min ago'
          },
        ])
      } finally {
        setLastUpdated(new Date())
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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

  const primaryFlight = recentFlights[0] || null
  const departureIcao = primaryFlight ? primaryFlight.origin : '—'
  const destinationIcao = primaryFlight ? primaryFlight.destination : '—'
  const plannedFlightTime = primaryFlight ? primaryFlight.time : '—'
  const plannedDistance = '—'

  return (
    <div className="space-y-6 bg-[#F8F9FB]">
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
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <FlightMap 
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
            <div className="flex items-center justify-between mb-4">
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
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
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

      {/* Flight Route Weather Summary */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Flight Route Weather Summary</h2>
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
          {['FL180','FL240','FL300','FL360'].map((level, i) => {
            const ref = quickWeather[i % (quickWeather.length || 1)] || quickWeather[0] || { severity: { level: 'unknown' } }
            return (
              <div key={level} className="p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-700">{level}</div>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    ref.severity.level === 'critical' ? 'bg-red-500' :
                    ref.severity.level === 'caution' ? 'bg-yellow-400' :
                    ref.severity.level === 'normal' ? 'bg-green-500' : 'bg-slate-300'
                  }`}></span>
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
                  Turbulence: {ref.severity.level === 'critical' ? 'Severe' : ref.severity.level === 'caution' ? 'Moderate' : 'Light'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard