import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from 'recharts'
import { fetchHistoricalWeather, generateMockHistoricalData, getWindDirectionCategory, calculateTrend, calculateLinearRegression } from '../services/weatherApiService'

const defaultStats = { average: null, max: null, min: null, trend: '—' }

function computeStats(values = []) {
  if (!values.length) return defaultStats
  
  const sum = values.reduce((s, v) => s + v, 0)
  const average = Number(sum / values.length)
  const max = Math.max(...values)
  const min = Math.min(...values)
  
  // Use linear regression for more accurate trend calculation
  const regression = calculateLinearRegression(values)
  const trend = calculateTrend(values)
  
  return { 
    average, 
    max, 
    min, 
    trend,
    slope: regression.slope,
    rSquared: regression.rSquared
  }
}

const CardStat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-slate-900 mt-1 font-medium">{value == null ? '--' : (typeof value === 'number' ? Number(value).toFixed(1) : value)}</div>
  </div>
)

const TrendAnalysis = ({
  title,
  description,
  chartType = 'line',
  yUnitLabel,
  dataKey = 'value',
  xKey = 'time',
  simulateData,
}) => {
  const [airport, setAirport] = useState('')
  const [period, setPeriod] = useState('7d')
  const [interval, setInterval] = useState('hourly')
  const [data, setData] = useState([])
  const [renderKey, setRenderKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const stats = useMemo(() => {
    const values = data.map(d => Number(d[dataKey]) || 0)
    const computed = computeStats(values)
    
    // Use the new trend calculation function
    if (values.length > 0) {
      computed.trend = calculateTrend(values)
    }
    
    return computed
  }, [data, dataKey])

  const isValidICAO = (code) => {
    const upperCode = code.toUpperCase()
    return /^[A-Z]{4}$/.test(upperCode)
  }

  const getAirportName = (icao) => {
    const upperIcao = icao.toUpperCase()
    // Check if it's a common airport
    const commonAirports = {
      'KJFK': 'John F. Kennedy International Airport, New York',
      'KLAX': 'Los Angeles International Airport, California', 
      'KORD': 'Chicago O\'Hare International Airport, Illinois',
      'KDFW': 'Dallas/Fort Worth International Airport, Texas',
      'KATL': 'Hartsfield-Jackson Atlanta International Airport, Georgia',
      'KLAS': 'Harry Reid International Airport, Nevada',
      'KSEA': 'Seattle-Tacoma International Airport, Washington',
      'KPHX': 'Phoenix Sky Harbor International Airport, Arizona',
      'KMIA': 'Miami International Airport, Florida',
      'KBOS': 'Logan International Airport, Massachusetts'
    }
    return commonAirports[upperIcao] || `${upperIcao} Airport`
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
    setData([]) // Clear previous data
    
    try {
      // Try to fetch real weather data first
      let weatherData
      let dataSource = 'API'
      
      try {
        const apiResponse = await fetchHistoricalWeather(upperAirport, period)
        
        // Ensure weatherData is always an array
        if (Array.isArray(apiResponse)) {
          weatherData = apiResponse
        } else if (apiResponse && Array.isArray(apiResponse.data)) {
          // Handle case where API returns { data: [...] }
          weatherData = apiResponse.data
        } else if (apiResponse && Array.isArray(apiResponse.results)) {
          // Handle case where API returns { results: [...] }
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

      // Final validation - ensure weatherData is always an array
      if (!Array.isArray(weatherData)) {
        console.error('weatherData is not an array:', weatherData)
        weatherData = []
      }

      if (!weatherData || weatherData.length === 0) {
        throw new Error('No historical temperature data available for this airport and time period.')
      }

      // Process the data based on chart type
      let processedData = []
      
      if (chartType === 'line') {
        // For line charts (temperature, wind speed)
        processedData = weatherData
          .filter(item => item && item.timestamp) // Filter out invalid items
          .map((item, index) => {
          const date = new Date(item.timestamp)
          const time = interval === 'daily' 
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })
          
          if (dataKey === 'value') {
            // Temperature or wind speed
            const value = item.parsed?.temperature || item.parsed?.windSpeed || 0
            return { time, value, airport: upperAirport, fullTime: date }
          }
          return { time, [dataKey]: item.parsed?.[dataKey] || 0, airport: upperAirport, fullTime: date }
        })
      } else if (chartType === 'pie') {
        // For pie charts (condition severity)
        const conditionCounts = {}
        weatherData
          .filter(item => item && item.parsed) // Filter out invalid items
          .forEach(item => {
          const condition = item.parsed?.condition || 'VFR'
          conditionCounts[condition] = (conditionCounts[condition] || 0) + 1
        })
        
        const total = Object.values(conditionCounts).reduce((sum, count) => sum + count, 0)
        processedData = Object.entries(conditionCounts).map(([name, count]) => ({
          name,
          value: Math.round((count / total) * 100 * 10) / 10,
          airport: upperAirport
        }))
      } else if (chartType === 'radar') {
        // For radar charts (wind direction frequency)
        const directionCounts = {}
        weatherData
          .filter(item => item && item.parsed) // Filter out invalid items
          .forEach(item => {
          const direction = getWindDirectionCategory(item.parsed?.windDirection)
          directionCounts[direction] = (directionCounts[direction] || 0) + 1
        })
        
        const total = Object.values(directionCounts).reduce((sum, count) => sum + count, 0)
        processedData = Object.entries(directionCounts).map(([dir, count]) => ({
          dir,
          freq: Math.round((count / total) * 100),
          airport: upperAirport
        }))
      }

      setData(processedData)
      setRenderKey((k) => k + 1)
      
      // Show success message for mock data
      if (dataSource === 'Mock') {
        console.log(`Using enhanced mock data for ${getAirportName(upperAirport)}`)
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
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm text-center">
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div>Generating analysis...</div>
          </div>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm text-center">
          <div>
            <div className="text-3xl mb-2">⋯</div>
            <div>Chart will appear here</div>
            <div className="text-xs mt-1">Enter a valid ICAO code and click "Generate Analysis"</div>
          </div>
        </div>
      )
    }

    if (chartType === 'line') {
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
        <ResponsiveContainer key={renderKey} width="100%" height={300}>
          <LineChart data={trendLineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 11 }} 
              stroke="#64748b"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              stroke="#64748b" 
              label={{ value: yUnitLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                `${value}${yUnitLabel}`, 
                name === 'value' ? 'Temperature' : name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
            {stats.slope !== undefined && Math.abs(stats.slope) > 0.1 && (
              <Line 
                type="monotone" 
                dataKey="trendValue" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                name="Trend Line"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer key={renderKey} width="100%" height={256}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" label={{ value: yUnitLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'pie') {
      const colors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']
      return (
        <ResponsiveContainer key={renderKey} width="100%" height={256}>
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'radar') {
      return (
        <ResponsiveContainer key={renderKey} width="100%" height={256}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xKey} />
            <PolarRadiusAxis />
            <Radar name={title} dataKey={dataKey} stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      )
    }

    return null
  }

  return (
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
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
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
              {loading ? 'Generating...' : 'Generate Analysis'}
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
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Trend Visualization</h2>
          <div className="border border-slate-200 rounded-xl p-2">{renderChart()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardStat label="Average Temperature" value={stats.average} />
          <CardStat label="Maximum Temperature" value={stats.max} />
          <CardStat label="Minimum Temperature" value={stats.min} />
          <CardStat label="Trend Direction" value={stats.trend} />
        </div>
        {stats.rSquared !== undefined && stats.rSquared > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">Trend Analysis</div>
            <div className="text-sm text-blue-800">
              R² = {stats.rSquared.toFixed(3)} • Slope = {stats.slope?.toFixed(3)}°C per period
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrendAnalysis


