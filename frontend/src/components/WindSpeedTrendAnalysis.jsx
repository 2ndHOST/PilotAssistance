import { Link } from 'react-router-dom'
import { ArrowLeft, Wind } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const WindSpeedTrendAnalysis = () => {
  const simulateData = ({ airport, period, interval }) => {
    const seed = (airport || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
    const times = ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00']
    const periodFactor = period === '30d' ? 1.4 : period === '14d' ? 1.2 : 1.0
    const intervalFactor = interval === 'daily' ? 0.9 : 1.0
    return times.map((t, i) => ({
      time: t,
      value: Math.round((8 + Math.abs(Math.sin((i + (seed % 7)) / 1.3)) * 12 * periodFactor * intervalFactor) * 10) / 10
    }))
  }
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
          Track wind speed variations and patterns to understand wind behavior at your selected airports.
        </p>
      </div>

      <TrendAnalysis
        title="Wind Speed Trend"
        description=""
        chartType="line"
        yUnitLabel="kt"
        xKey="time"
        dataKey="value"
        simulateData={simulateData}
      />
    </div>
  )
}

export default WindSpeedTrendAnalysis


