import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import TrendAnalysis from './TrendAnalysis'

const WindDirectionFrequencyAnalysis = () => {
  const simulateData = ({ airport, period, interval }) => (
    (() => {
      const seed = (airport || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
      const mult = period === '30d' ? 1.1 : period === '14d' ? 1.05 : 1
      const dirs = ['N','NE','E','SE','S','SW','W','NW']
      const base = [8,12,6,4,10,15,20,25].map((v, i) => Math.round(v * mult + ((seed + i) % 3) - 1))
      const sum = base.reduce((a,b)=>a+b,0)
      // Normalize to 100
      return dirs.map((dir, i) => ({ dir, freq: Math.round(base[i] * 100 / sum) }))
    })()
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
          <Compass className="h-6 w-6 mr-2 text-blue-600" />
          Wind Direction Frequency Analysis
        </h1>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Analyze wind direction patterns and frequency distributions for optimal flight planning.
        </p>
      </div>

      <TrendAnalysis
        title="Wind Direction Frequency"
        description=""
        chartType="radar"
        yUnitLabel="%"
        xKey="dir"
        dataKey="freq"
        simulateData={simulateData}
      />
    </div>
  )
}

export default WindDirectionFrequencyAnalysis


