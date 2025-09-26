import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const WindDirectionFrequencyAnalysis = () => {
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
          <Compass className="h-6 w-6 mr-2 text-blue-600" />
          Wind Direction Frequency Analysis
        </h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Analyze wind direction patterns and frequency distributions for optimal flight planning.
        </p>
      </div>

      <TrendAnalysis
        title="Wind Direction Frequency"
        description="Analyze wind direction patterns and frequency distributions using real METAR data."
        chartType="radar"
        yUnitLabel="%"
        xKey="dir"
        dataKey="freq"
      />
    </div>
  )
}

export default WindDirectionFrequencyAnalysis


