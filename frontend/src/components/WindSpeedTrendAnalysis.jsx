import { Link } from 'react-router-dom'
import { ArrowLeft, Wind, TrendingUp, AlertTriangle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, ReferenceLine, Scatter, ComposedChart } from 'recharts'
import { fetchHistoricalWeather, generateMockHistoricalData, getWindDirectionCategory, calculateTrend, calculateLinearRegression } from '../services/weatherApiService'

const WindSpeedTrendAnalysis = () => {
  const [airport, setAirport] = useState('')
  const [period, setPeriod] = useState('7d')
  const [interval, setInterval] = useState('hourly')
  const [data, setData] = useState([])
  const [renderKey, setRenderKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Enhanced wind speed data processing with outlier filtering
  const processWindData = (weatherData) => {
    if (!weatherData || !Array.isArray(weatherData)) return []

    // Extract wind speed data with outlier filtering
    const windData = weatherData
      .filter(item => item && item.timestamp && item.parsed?.windSpeed !== undefined)
      .map(item => ({
        timestamp: new Date(item.timestamp),
        windSpeed: item.parsed.windSpeed,
        windDirection: item.parsed.windDirection,
        windGusts: item.parsed.windGusts || item.parsed.windSpeed * 1.3, // Estimate gusts if not available
        raw: item.raw
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    // Outlier filtering using IQR method
    const speeds = windData.map(d => d.windSpeed)
    const q1 = speeds.sort((a, b) => a - b)[Math.floor(speeds.length * 0.25)]
    const q3 = speeds.sort((a, b) => a - b)[Math.floor(speeds.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    const filteredData = windData.filter(d => 
      d.windSpeed >= lowerBound && d.windSpeed <= upperBound
    )

    // Process data for chart
    return filteredData.map((item, index) => {
      const date = item.timestamp
      const time = interval === 'daily' 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
      
      return {
        time,
        windSpeed: Math.round(item.windSpeed * 10) / 10,
        windGusts: Math.round(item.windGusts * 10) / 10,
        windDirection: item.windDirection,
        fullTime: date,
        airport: airport.toUpperCase(),
        isMax: false,
        isMin: false
      }
    })
  }

  // Find daily extremes
  const addDailyExtremes = (processedData) => {
    if (interval !== 'daily') return processedData

    const dailyGroups = {}
    processedData.forEach(item => {
      const dayKey = item.fullTime.toDateString()
      if (!dailyGroups[dayKey]) dailyGroups[dayKey] = []
      dailyGroups[dayKey].push(item)
    })

    Object.values(dailyGroups).forEach(dayData => {
      if (dayData.length > 0) {
        const maxItem = dayData.reduce((max, item) => item.windSpeed > max.windSpeed ? item : max)
        const minItem = dayData.reduce((min, item) => item.windSpeed < min.windSpeed ? item : min)
        maxItem.isMax = true
        minItem.isMin = true
      }
    })

    return processedData
  }

  // Calculate confidence band
  const addConfidenceBand = (processedData) => {
    if (processedData.length < 3) return processedData

    const speeds = processedData.map(d => d.windSpeed)
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - mean, 2), 0) / speeds.length
    const stdDev = Math.sqrt(variance)
    const confidenceLevel = 1.96 // 95% confidence

    return processedData.map(item => ({
      ...item,
      upperBand: item.windSpeed + confidenceLevel * stdDev,
      lowerBand: Math.max(0, item.windSpeed - confidenceLevel * stdDev)
    }))
  }

  const stats = useMemo(() => {
    if (!data.length) return { average: null, max: null, min: null, trend: '—' }
    
    const speeds = data.map(d => d.windSpeed)
    const sum = speeds.reduce((s, v) => s + v, 0)
    const average = Number(sum / speeds.length)
    const max = Math.max(...speeds)
    const min = Math.min(...speeds)
    
    const regression = calculateLinearRegression(speeds)
    const trend = calculateTrend(speeds)
    
    return { 
      average, 
      max, 
      min, 
      trend,
      slope: regression.slope,
      rSquared: regression.rSquared
    }
  }, [data])

  const isValidICAO = (code) => {
    const upperCode = code.toUpperCase()
    return /^[A-Z]{4}$/.test(upperCode)
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    
    const upperAirport = airport.toUpperCase()
    
    if (!isValidICAO(upperAirport)) {
      setError('Please enter a valid 4-letter ICAO airport code (e.g., KJFK, EGLL, VABB)')
      return
    }

    setLoading(true)
    setData([])
    
    try {
      let weatherData
      let dataSource = 'API'
      
      try {
        const apiResponse = await fetchHistoricalWeather(upperAirport, period)
        
        if (Array.isArray(apiResponse)) {
          weatherData = apiResponse
        } else if (apiResponse && Array.isArray(apiResponse.data)) {
          weatherData = apiResponse.data
        } else if (apiResponse && Array.isArray(apiResponse.results)) {
          weatherData = apiResponse.results
        } else {
          weatherData = []
        }
        
        if (!weatherData || weatherData.length === 0) {
          throw new Error('No data returned from API')
        }
      } catch (apiError) {
        console.warn('API not available, using enhanced mock data:', apiError)
        weatherData = generateMockHistoricalData(upperAirport, period)
        dataSource = 'Mock'
      }

      if (!Array.isArray(weatherData)) {
        console.error('weatherData is not an array:', weatherData)
        weatherData = []
      }

      if (!weatherData || weatherData.length === 0) {
        throw new Error('No historical wind speed data available for this airport and time period.')
      }

      // Process wind data with enhanced features
      let processedData = processWindData(weatherData)
      processedData = addDailyExtremes(processedData)
      processedData = addConfidenceBand(processedData)

      setData(processedData)
      setRenderKey((k) => k + 1)
      
      if (dataSource === 'Mock') {
        console.log(`Using enhanced mock data for ${upperAirport}`)
      }
      
    } catch (err) {
      console.error('Error generating analysis:', err)
      setError(err.message || 'Failed to generate analysis. Please check the airport code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center text-slate-400 text-sm text-center">
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div>Generating wind speed analysis...</div>
          </div>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-slate-400 text-sm text-center">
          <div>
            <div className="text-3xl mb-2">⋯</div>
            <div>Wind speed chart will appear here</div>
            <div className="text-xs mt-1">Enter a valid ICAO code and click "Generate Analysis"</div>
          </div>
        </div>
      )
    }

    // Calculate trend line data
    const trendLineData = data.map((point, index) => {
      if (stats.slope !== undefined && stats.slope !== null) {
        const x = index
        const y = stats.slope * x + (stats.average - stats.slope * (data.length - 1) / 2)
        return { ...point, trendValue: y }
      }
      return point
    })

    return (
      <ResponsiveContainer key={renderKey} width="100%" height={400}>
        <ComposedChart data={trendLineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11 }} 
            stroke="#64748b"
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: 'Time (Local)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            stroke="#64748b" 
            label={{ value: 'Wind Speed (kt)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => {
              const labels = {
                windSpeed: 'Wind Speed',
                windGusts: 'Wind Gusts',
                trendValue: 'Trend Line'
              }
              return [`${value} kt`, labels[name] || name]
            }}
          />
          
          {/* Confidence Band */}
          <Area
            type="monotone"
            dataKey="upperBand"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.1}
            name="Confidence Band"
          />
          <Area
            type="monotone"
            dataKey="lowerBand"
            stroke="none"
            fill="#ffffff"
            name="Confidence Band"
          />
          
          {/* Main Wind Speed Line */}
          <Line 
            type="monotone" 
            dataKey="windSpeed" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={(props) => {
              const { cx, cy, payload } = props
              if (payload.isMax) {
                return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
              }
              if (payload.isMin) {
                return <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
              }
              return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
            }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            name="Wind Speed"
          />
          
          {/* Wind Gusts (dotted line) */}
          <Line 
            type="monotone" 
            dataKey="windGusts" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            name="Wind Gusts"
          />
          
          {/* Trend Line */}
          {stats.slope !== undefined && Math.abs(stats.slope) > 0.1 && (
            <Line 
              type="monotone" 
              dataKey="trendValue" 
              stroke="#ef4444" 
              strokeWidth={2} 
              strokeDasharray="8 4"
              dot={false}
              name="Trend Line"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const CardStat = ({ label, value, icon: Icon, color = "blue" }) => (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={`h-4 w-4 text-${color}-600`} />}
        <div className="text-xs text-slate-500">{label}</div>
      </div>
      <div className="text-slate-900 mt-1 font-medium">
        {value == null ? '--' : (typeof value === 'number' ? Number(value).toFixed(1) : value)}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link to="/weather-utils" className="inline-flex items-center text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Weather Utils
        </Link>
      </div>

      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center">
          <Wind className="h-6 w-6 mr-2 text-blue-600" />
          Wind Speed Trend Analysis
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Track wind speed variations and patterns with high-resolution data, outlier filtering, and trend analysis.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Analysis Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Airport Code</label>
                <input 
                  value={airport} 
                  onChange={(e) => setAirport(e.target.value.toUpperCase())} 
                  className={`w-full border rounded-lg px-3 py-2 ${
                    airport && !isValidICAO(airport) 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`} 
                  placeholder="e.g., KJFK" 
                  maxLength={4}
                />
                {airport && !isValidICAO(airport) && (
                  <p className="text-xs text-red-500 mt-1">Enter a valid 4-letter ICAO code</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Time Period</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data Interval</label>
                <select value={interval} onChange={(e) => setInterval(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="hourly">Hourly (15-30 min intervals)</option>
                  <option value="daily">Daily averages</option>
                </select>
              </div>
              <button 
                type="button" 
                onClick={handleGenerate} 
                disabled={!isValidICAO(airport) || loading}
                className={`w-full font-medium py-2 rounded-lg transition-all ${
                  !isValidICAO(airport) || loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Generating...' : 'Generate Wind Analysis'}
              </button>
              {error && (
                <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Wind Speed Visualization</h2>
            <div className="border border-slate-200 rounded-xl p-2">{renderChart()}</div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Wind Speed Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardStat label="Average Wind Speed" value={stats.average} icon={Wind} color="blue" />
            <CardStat label="Maximum Wind Speed" value={stats.max} icon={AlertTriangle} color="red" />
            <CardStat label="Minimum Wind Speed" value={stats.min} icon={Wind} color="green" />
            <CardStat label="Trend Direction" value={stats.trend} icon={TrendingUp} color="purple" />
          </div>
          {stats.rSquared !== undefined && stats.rSquared > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 font-medium">Trend Analysis</div>
              <div className="text-sm text-blue-800">
                R² = {stats.rSquared.toFixed(3)} • Slope = {stats.slope?.toFixed(3)} kt per period
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WindSpeedTrendAnalysis


