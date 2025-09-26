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

  return (
    <div className="space-y-6">
      {/* Header with Stats in One Line */}
      <div className="flex items-center justify-between gap-6">
        {/* Pilot Dashboard Title */}
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900">Pilot Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Weather conditions and flight planning tools
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="flex items-center gap-4 flex-1">
          <div className="aviation-card p-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-aviation-100 rounded-lg">
                <Plane className="h-5 w-5 text-aviation-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Recent Flights</p>
                <p className="text-xl font-bold text-slate-900">{recentFlights.length}</p>
              </div>
            </div>
          </div>

          <div className="aviation-card p-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CloudRain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Monitored Airports</p>
                <p className="text-xl font-bold text-slate-900">{quickWeather.length}</p>
              </div>
            </div>
          </div>

          <div className="aviation-card p-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Alerts</p>
                <p className="text-xl font-bold text-slate-900">
                  {quickWeather.filter(w => w.severity.level !== 'normal').length}
                </p>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Conditions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aviation-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Wind className="h-5 w-5 mr-2 text-slate-600" />
              Current Weather Conditions
            </h2>
            <div className="space-y-4">
              {quickWeather.map((weather) => (
                <div 
                  key={weather.icao}
                  className={`p-4 rounded-lg border ${getSeverityColor(weather.severity.level)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{weather.severity.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{weather.icao}</h3>
                        <p className="text-sm opacity-90">{weather.conditions}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TTSControls 
                        text={`${weather.icao}: ${weather.conditions}`}
                        size="small"
                        className="relative"
                      />
                      <div className="text-right text-xs opacity-70">
                        Updated {weather.updated}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flight Map - Now below Current Weather */}
          <FlightMap 
            airports={quickWeather}
            height="300px"
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
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
          
          {/* Recent Flights - Now in place of FlightMap */}
          <div className="aviation-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-slate-600" />
                Recent Flight Plans
              </h2>
              <button
                onClick={() => setShowFlightSearch(!showFlightSearch)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {/* Search Input */}
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

            <div className="space-y-3">
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <div key={flight.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
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
    </div>
  )
}

export default Dashboard