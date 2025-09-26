import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const ConditionSeverityDistribution = () => {
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
          <Info className="h-6 w-6 mr-2 text-blue-600" />
          Condition Severity Distribution
        </h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Examine the distribution and frequency of various weather condition severities.
        </p>
      </div>

      <TrendAnalysis
        title="Condition Severity Distribution"
        description="Examine flight condition distribution based on visibility and ceiling from METAR data."
        chartType="pie"
        yUnitLabel="%"
        xKey="name"
        dataKey="value"
      />
    </div>
  )
}

export default ConditionSeverityDistribution


