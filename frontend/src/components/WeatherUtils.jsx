import { Link } from 'react-router-dom'
import { Cloud, FileText, Thermometer, Wind, Gauge, Compass, Zap, LineChart, Sparkles, AlertTriangle, MapPin, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useState } from 'react'

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

const DecoderPanel = ({ type, isOpen, onClose }) => {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDecode = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResults = {
        metar: {
          success: true,
          decoded: {
            summary: 'METAR decoded: KORD 101551Z 27015KT 10SM FEW250 15/12 A2992 RMK AO2 SLP134 T01500117',
            details: {
              airport: 'KORD (Chicago O\'Hare)',
              time: '15:51 UTC on the 10th',
              wind: '270° at 15 knots',
              visibility: '10 statute miles',
              clouds: 'Few clouds at 25,000 ft',
              temperature: '15°C / 12°C',
              pressure: '29.92 inHg'
            }
          }
        },
        taf: {
          success: true,
          decoded: {
            summary: 'TAF decoded: KORD 101200Z 1012/1112 27012KT P6SM FEW250 FM101800 28015G25KT P6SM SCT040 BKN080 TEMPO 1020/1024 2SM TSRA BKN040CB',
            details: {
              airport: 'KORD (Chicago O\'Hare)',
              validPeriod: '12:00 UTC 10th to 12:00 UTC 11th',
              wind: '270° at 12 knots, gusting to 25 knots after 18:00',
              visibility: '6+ statute miles',
              clouds: 'Few at 25,000 ft, scattered at 4,000 ft, broken at 8,000 ft',
              conditions: 'Temporary thunderstorms with 2 mile visibility'
            }
          }
        },
        notam: {
          success: true,
          decoded: {
            summary: 'NOTAM decoded: Runway 09L/27R closed for maintenance until 2024-01-15 1200Z. Use runway 09R/27L as alternate.',
            details: {
              type: 'Runway Closure',
              validUntil: '2024-01-15 1200Z',
              affectedRunway: '09L/27R',
              alternateRunway: '09R/27L'
            }
          }
        },
        sigmet: {
          success: true,
          decoded: {
            summary: 'SIGMET decoded: Severe turbulence reported at FL250-350 over area bounded by coordinates. Valid until 2024-01-10 1800Z.',
            details: {
              type: 'Severe Turbulence',
              altitude: 'FL250-350',
              validUntil: '2024-01-10 1800Z',
              severity: 'Severe'
            }
          }
        },
        pirep: {
          success: true,
          decoded: {
            summary: 'PIREP decoded: Moderate turbulence at FL180, light icing conditions, visibility 10+ miles, scattered clouds at 3000ft.',
            details: {
              altitude: 'FL180',
              turbulence: 'Moderate',
              icing: 'Light',
              visibility: '10+ miles',
              clouds: 'Scattered at 3000ft'
            }
          }
        }
      }
      
      setResult(mockResults[type] || { success: true, decoded: { summary: 'Decoded successfully' } })
    } catch (error) {
      setResult({ success: false, error: 'Failed to decode: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInput('')
    setResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900">Decode {type.toUpperCase()}</h4>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter raw ${type.toUpperCase()} text here...`}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-none"
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleDecode}
              disabled={loading || !input.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Decoding...' : 'Decode'}
            </button>
            
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
              <h5 className="font-medium text-slate-900 mb-2">Decoded Result:</h5>
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">{result.decoded.summary}</p>
                  {result.decoded.details && (
                    <div className="text-xs text-slate-500">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(result.decoded.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-600">{result.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ItemCard = ({ to, icon: Icon, title, subtitle, accent = 'blue', isExpandable = false, onToggle, isExpanded = false }) => {
  const content = (
    <div className={`group flex items-start gap-3 rounded-xl border border-slate-200 p-4 bg-white hover:bg-slate-50 hover:shadow-sm transition-all duration-200 ${isExpandable ? 'cursor-pointer' : ''}`}>
      <div className={`h-10 w-10 rounded-xl bg-${accent}-100 text-${accent}-600 flex items-center justify-center shadow-sm`}> 
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {isExpandable && (
            <div className="text-slate-400">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )

  if (isExpandable) {
    return (
      <div onClick={onToggle}>
        {content}
      </div>
    )
  }

  return (
    <Link to={to} className="no-underline hover:no-underline">
      {content}
    </Link>
  )
}

const WeatherUtils = () => {
  const [expandedDecoder, setExpandedDecoder] = useState(null)

  const handleDecoderToggle = (decoderType) => {
    setExpandedDecoder(expandedDecoder === decoderType ? null : decoderType)
  }

  const handleDecoderClose = () => {
    setExpandedDecoder(null)
  }

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Weather Analysis Suite</h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Quickly access decoders and trend analyses with a clean, modern layout.</p>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decoder */}
        <SectionCard>
          <CardHeader title="Weather Decoder" />
          <div className="p-6 grid sm:grid-cols-1 gap-4">
            {/* All Decoders - Expandable */}
            <div>
              <ItemCard
                icon={Cloud}
                title="METAR"
                subtitle="Meteorological Aerodrome Report"
                accent="blue"
                isExpandable={true}
                onToggle={() => handleDecoderToggle('metar')}
                isExpanded={expandedDecoder === 'metar'}
              />
              <DecoderPanel
                type="metar"
                isOpen={expandedDecoder === 'metar'}
                onClose={handleDecoderClose}
              />
            </div>
            
            <div>
              <ItemCard
                icon={FileText}
                title="TAF"
                subtitle="Terminal Aerodrome Forecast"
                accent="violet"
                isExpandable={true}
                onToggle={() => handleDecoderToggle('taf')}
                isExpanded={expandedDecoder === 'taf'}
              />
              <DecoderPanel
                type="taf"
                isOpen={expandedDecoder === 'taf'}
                onClose={handleDecoderClose}
              />
            </div>
            
            <div>
              <ItemCard
                icon={AlertTriangle}
                title="NOTAMs"
                subtitle="Notice to Air Missions"
                accent="orange"
                isExpandable={true}
                onToggle={() => handleDecoderToggle('notam')}
                isExpanded={expandedDecoder === 'notam'}
              />
              <DecoderPanel
                type="notam"
                isOpen={expandedDecoder === 'notam'}
                onClose={handleDecoderClose}
              />
            </div>
            
            <div>
              <ItemCard
                icon={MapPin}
                title="SIGMET / AIRMET"
                subtitle="Significant / Airmen Meteorological Information"
                accent="red"
                isExpandable={true}
                onToggle={() => handleDecoderToggle('sigmet')}
                isExpanded={expandedDecoder === 'sigmet'}
              />
              <DecoderPanel
                type="sigmet"
                isOpen={expandedDecoder === 'sigmet'}
                onClose={handleDecoderClose}
              />
            </div>
            
            <div>
              <ItemCard
                icon={MessageSquare}
                title="PIREPs"
                subtitle="Pilot Weather Reports"
                accent="green"
                isExpandable={true}
                onToggle={() => handleDecoderToggle('pirep')}
                isExpanded={expandedDecoder === 'pirep'}
              />
              <DecoderPanel
                type="pirep"
                isOpen={expandedDecoder === 'pirep'}
                onClose={handleDecoderClose}
              />
            </div>
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