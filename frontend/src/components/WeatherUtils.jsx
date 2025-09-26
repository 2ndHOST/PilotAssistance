import { Link } from 'react-router-dom'
import { Cloud, ChevronRight } from 'lucide-react'

const LinkItem = ({ to, label, color = 'blue' }) => (
  <Link
    to={to}
    className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl border bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px] border-slate-200`}
  >
    <span className="font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
    <ChevronRight className={`h-4 w-4 text-${color}-500 group-hover:translate-x-0.5 transition-transform`} />
  </Link>
)

const WeatherUtils = () => {
  return (
    <div className="min-h-[60vh]">
      {/* Top Icon */}
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow">
          <Cloud className="h-6 w-6" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Weather Analysis Suite</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Quickly access weather decoders and trend analyses</p>
      </div>

      {/* Unified Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather Decoder Section */}
          <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Weather Decoder</h2>
            <div className="grid gap-2">
              <LinkItem to="/metar-decoder" label="METAR" color="blue" />
              <LinkItem to="/taf-decoder" label="TAF" color="violet" />
            </div>
          </div>

          {/* Weather Trends Section */}
          <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Weather Trends</h2>
            <div className="grid gap-2">
              <LinkItem to="/temperature-trend-analysis" label="Temperature Trend" color="rose" />
              <LinkItem to="/wind-speed-trend-analysis" label="Wind Speed Trend" color="sky" />
              <LinkItem to="/condition-severity-distribution" label="Condition Severity Distribution" color="amber" />
              <LinkItem to="/wind-direction-frequency-analysis" label="Wind Direction Frequency" color="purple" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherUtils