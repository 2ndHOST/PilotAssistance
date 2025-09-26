import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const defaultStats = { average: null, max: null, min: null, trend: '—' }

function computeStats(values = []) {
  if (!values.length) return defaultStats
  const sum = values.reduce((s, v) => s + v, 0)
  const average = Number(sum / values.length)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const trend = values[values.length - 1] > values[0] ? 'Increasing' : values[values.length - 1] < values[0] ? 'Decreasing' : 'Stable'
  return { average, max, min, trend }
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
  const stats = useMemo(() => computeStats(data.map(d => Number(d[dataKey]) || 0)), [data, dataKey])

  const handleGenerate = (e) => {
    e.preventDefault()
    const generated = simulateData ? simulateData({ airport, period, interval }) : []
    // Always update state with a new reference and bump key to force remount of the chart
    setData(Array.isArray(generated) ? [...generated] : generated)
    setRenderKey((k) => k + 1)
  }

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm text-center">
          <div>
            <div className="text-3xl mb-2">⋯</div>
            <div>Chart will appear here</div>
            <div className="text-xs mt-1">Configure settings and click "Generate Analysis"</div>
          </div>
        </div>
      )
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer key={renderKey} width="100%" height={256}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" label={{ value: yUnitLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
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
              <input value={airport} onChange={(e) => setAirport(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g., KJFK" />
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
            <button type="button" onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg">Generate Analysis</button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <CardStat label="Average Value" value={stats.average} />
          <CardStat label="Maximum Value" value={stats.max} />
          <CardStat label="Minimum Value" value={stats.min} />
          <CardStat label="Trend Direction" value={stats.trend} />
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis


