import { Link } from 'react-router-dom'

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="p-4">
      <div className="grid gap-2">
        {children}
      </div>
    </div>
  </div>
)

const NavItem = ({ to, label }) => (
  <Link
    to={to}
    className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
  >
    <span className="font-medium">{label}</span>
    <span className="text-slate-400">→</span>
  </Link>
)

const WeatherUtils = () => {
  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weather Analysis Suite</h1>
        <p className="text-slate-500 mt-1">Quickly access decoders and trend analyses</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Weather Decoder */}
        <Card title="Weather Decoder">
          <NavItem to="/metar-decoder" label="METAR" />
          <NavItem to="/taf-decoder" label="TAF" />
        </Card>

        {/* Column 2: Weather Trends */}
        <Card title="Weather Trends">
          <NavItem to="/temperature-trend-analysis" label="Temperature Trend" />
          <NavItem to="/wind-speed-trend-analysis" label="Wind Speed Trend" />
          <NavItem to="/condition-severity-distribution" label="Condition Severity Distribution" />
          <NavItem to="/wind-direction-frequency-analysis" label="Wind Direction Frequency" />
        </Card>
      </div>
    </div>
  )
}

export default WeatherUtils


