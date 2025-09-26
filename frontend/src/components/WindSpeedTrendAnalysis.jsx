import { Link } from 'react-router-dom'
import { ArrowLeft, Wind } from 'lucide-react'

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

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analysis Settings */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Analysis Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Airport Code</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g., KJFK" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Time Period</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option>Last 7 days</option>
                  <option>Last 14 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data Interval</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option>Hourly</option>
                  <option>Daily</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg">
                Generate Analysis
              </button>
            </div>
          </div>

          {/* Trend Visualization */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Trend Visualization</h2>
            <div className="border border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm text-center px-6">
              <div>
                <div className="text-3xl mb-2">〰</div>
                <div>Chart will appear here</div>
                <div className="text-xs mt-1">Configure settings and click "Generate Analysis" to view trends</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Summary Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-xs text-slate-500">Average Value</div>
              <div className="text-slate-400 mt-1">--</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-green-50">
              <div className="text-xs text-slate-500">Maximum Value</div>
              <div className="text-slate-600 mt-1">--</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-orange-50">
              <div className="text-xs text-slate-500">Minimum Value</div>
              <div className="text-slate-600 mt-1">--</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-purple-50">
              <div className="text-xs text-slate-500">Trend Direction</div>
              <div className="text-slate-600 mt-1">--</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WindSpeedTrendAnalysis


