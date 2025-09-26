import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const ConditionSeverityDistribution = () => {
  const simulateData = ({ airport, period, interval }) => {
    const seed = (airport || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
    const baseNormal = 55 + (seed % 20)
    const baseCaution = 30 - (seed % 10)
    const baseCritical = 100 - baseNormal - baseCaution
    return [
      { name: 'Normal', value: baseNormal },
      { name: 'Caution', value: baseCaution },
      { name: 'Critical', value: baseCritical }
    ]
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
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 mr-2"></span>
          Condition Severity Distribution
        </h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Examine the distribution and frequency of various weather condition severities.
        </p>
      </div>

      <TrendAnalysis
        title="Condition Severity Distribution"
        description=""
        chartType="pie"
        yUnitLabel="%"
        xKey="name"
        dataKey="value"
        simulateData={simulateData}
      />
    </div>
  )
}

export default ConditionSeverityDistribution


