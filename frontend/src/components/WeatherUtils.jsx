import { Link } from 'react-router-dom'
import { Cloud, FileText, Thermometer, Wind, Gauge, Compass, Zap, LineChart, Sparkles } from 'lucide-react'

const CardHeader = ({ title }) => (
  <div className="px-6 py-4 border-b border-slate-100">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
  </div>
)

const SectionCard = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    {children}
  </div>
)

const ItemCard = ({ to, icon: Icon, title, subtitle, accent = 'blue' }) => (
  <Link
    to={to}
    className={`group flex items-start gap-3 rounded-xl border border-slate-200 p-4 bg-white hover:bg-slate-50 hover:shadow-sm transition-all duration-200 no-underline hover:no-underline`}
  >
    <div className={`h-10 w-10 rounded-xl bg-${accent}-100 text-${accent}-600 flex items-center justify-center shadow-sm`}> 
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 no-underline">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 mt-0.5 underline">{subtitle}</p>
    </div>
  </Link>
)

const WeatherUtils = () => {
  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Weather Analysis Suite</h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Quickly access decoders and trend analyses with a clean, modern layout.</p>
      </div>

      {/* Two-column main cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decoder */}
        <SectionCard>
          <CardHeader title="Weather Decoder" />
          <div className="p-6 grid sm:grid-cols-1 gap-4">
            <ItemCard
              to="/metar-decoder"
              icon={Cloud}
              title="METAR"
              subtitle="Meteorological Aerodrome Report"
              accent="blue"
            />
            <ItemCard
              to="/taf-decoder"
              icon={FileText}
              title="TAF"
              subtitle="Terminal Aerodrome Forecast"
              accent="violet"
            />
          </div>
        </SectionCard>

        {/* Trends */}
        <SectionCard>
          <CardHeader title="Weather Trends" />
          <div className="p-6 grid sm:grid-cols-1 gap-4">
            <ItemCard
              to="/temperature-trend-analysis"
              icon={Thermometer}
              title="Temperature Trend"
              subtitle="Visualize temperature over time"
              accent="rose"
            />
            <ItemCard
              to="/wind-speed-trend-analysis"
              icon={Wind}
              title="Wind Speed Trend"
              subtitle="Analyze wind speed variations"
              accent="sky"
            />
            <ItemCard
              to="/condition-severity-distribution"
              icon={Gauge}
              title="Condition Severity"
              subtitle="Distribution of flight condition severity"
              accent="amber"
            />
            <ItemCard
              to="/wind-direction-frequency-analysis"
              icon={Compass}
              title="Wind Direction"
              subtitle="Frequency by direction"
              accent="purple"
            />
          </div>
        </SectionCard>
      </div>

      {/* Bottom feature row */}
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-all">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Real-time Data</h3>
                <p className="text-sm text-slate-500">Up-to-date aviation weather with smart fallbacks.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-all">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Advanced Analytics</h3>
                <p className="text-sm text-slate-500">Trends and summaries for informed planning.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition-all">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Instant Decoding</h3>
                <p className="text-sm text-slate-500">Readable insights from raw METAR/TAF reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherUtils