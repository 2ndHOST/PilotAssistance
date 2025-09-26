import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const TemperatureTrendAnalysis = () => {
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
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Temperature Trend Analysis
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Analyze temperature patterns and variations over time to identify trends and forecasting
          patterns.
        </p>
      </div>

      <TrendAnalysis
        title="Temperature Trend"
        description="Analyze temperature patterns and variations over time using real METAR data."
        chartType="line"
        yUnitLabel="°C"
        xKey="time"
        dataKey="value"
      />
    </div>
  )
}

export default TemperatureTrendAnalysis


