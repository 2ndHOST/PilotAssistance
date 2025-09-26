import { Link } from 'react-router-dom'
import { ArrowLeft, Wind } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const WindSpeedTrendAnalysis = () => {
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
        description="Track wind speed variations and patterns using real METAR data."
        chartType="line"
        yUnitLabel="kt"
        xKey="time"
        dataKey="value"
      />
    </div>
  )
}

export default WindSpeedTrendAnalysis


