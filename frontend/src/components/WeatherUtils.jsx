import { Link } from 'react-router-dom'
import { Cloud, FileText, Thermometer, Wind, Gauge, Compass, Zap, LineChart, Sparkles, AlertTriangle, MapPin, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useState } from 'react'
import weatherService from '../services/weatherService'

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

  // Build a plain-English summary, avoiding any JSON-like or coded METAR strings
  const buildPlainSummary = (res) => {
    if (!res?.success) return ''
    const raw = res.decoded?.summary
    const details = res.decoded?.details || {}
    const looksJsonLike = (s) => typeof s === 'string' && /\{[\s\S]*\}/.test(s) && /"[^"]+"\s*:/.test(s)
    const looksCodedMetar = (s) => typeof s === 'string' && (
      /\b[A-Z]{4}\b\s+\d{6}Z/.test(s) ||
      /\b\d{3}\d{2}KT\b/.test(s) ||
      /\b(\d{1,2})SM\b/.test(s) ||
      /\b(Q\d{4}|A\d{4})\b/.test(s) ||
      /\b(FEW|SCT|BKN|OVC)\d{3}\b/.test(s)
    )

    const station = details.airport || 'the airport'
    const when = details.time
    const wind = details.wind
    const vis = details.visibility
    const clouds = details.clouds
    const temp = details.temperature
    const press = details.pressure

    const parts = []
    parts.push(`Weather report for ${station}${when ? ` at ${when}` : ''}.`)
    if (wind) parts.push(`Winds: ${wind}.`)
    if (vis) parts.push(`Visibility: ${vis}.`)
    if (clouds) parts.push(`Clouds: ${clouds}.`)
    if (temp) parts.push(`Temperature: ${temp}.`)
    if (press) parts.push(`Pressure: ${press}.`)
    const narrative = parts.filter(Boolean).join(' ')

    // Prefer constructed narrative when we have any structured info
    if (narrative && narrative.trim() !== 'Weather report for the airport.') {
      return narrative
    }

  // Minimal METAR parser for common groups; returns an object similar to decoded.details
  const parseMetarDetails = (raw) => {
    if (typeof raw !== 'string') return {}
    const text = raw.trim()
    const parts = text.split(/\s+/)
    const details = {}

    // Station
    const metarIdx = parts[0] === 'METAR' || parts[0] === 'SPECI' ? 0 : -1
    const stationIdx = metarIdx === 0 ? 1 : 0
    details.airport = parts[stationIdx] || undefined

    // Time
    const timeToken = parts.find(p => /\d{6}Z/.test(p))
    if (timeToken) {
      const day = timeToken.slice(0,2)
      const hh = timeToken.slice(2,4)
      const mm = timeToken.slice(4,6)
      details.time = `${hh}:${mm}Z on the ${day}th`
    }

    // Wind
    const windToken = parts.find(p => /^(\d{3}|VRB)\d{2}(G\d{2})?KT$/.test(p))
    if (windToken) {
      const m = windToken.match(/^(\d{3}|VRB)(\d{2})(G(\d{2}))?KT$/)
      if (m) {
        const dir = m[1]
        const spd = m[2]
        const gst = m[4]
        details.wind = `${dir === 'VRB' ? 'Variable' : `${dir}°`} at ${parseInt(spd,10)} knots${gst ? `, gusting ${parseInt(gst,10)}` : ''}`
      }
    }

    // Visibility
    const visSM = parts.find(p => /^(P)?\d+SM$/.test(p))
    const visM = parts.find(p => /^\d{4}$/.test(p))
    if (visSM) {
      details.visibility = visSM.replace('P','')
        .replace('SM',' statute miles')
        .replace(/^\b(\d+)\b/, (_,n) => `${n}`)
    } else if (visM) {
      if (visM === '9999') details.visibility = '10 km or more'
      else details.visibility = `${parseInt(visM,10)} meters`
    }

    // Clouds
    const cloudTokens = parts.filter(p => /^(FEW|SCT|BKN|OVC)\d{3}/.test(p))
    if (cloudTokens.length) {
      const map = { FEW: 'Few', SCT: 'Scattered', BKN: 'Broken', OVC: 'Overcast' }
      details.clouds = cloudTokens.map(tok => {
        const m = tok.match(/^(FEW|SCT|BKN|OVC)(\d{3})/)
        if (!m) return tok
        const type = map[m[1]] || m[1]
        const base = parseInt(m[2],10) * 100
        return `${type} clouds at ${base.toLocaleString()} ft`
      }).join(', ')
    }

    // Temperature / Dewpoint
    const tdp = parts.find(p => /^(M?\d{1,2})\/(M?\d{1,2})$/.test(p))
    if (tdp) {
      const m = tdp.match(/^(M?\d{1,2})\/(M?\d{1,2})$/)
      const t = m[1].startsWith('M') ? -parseInt(m[1].slice(1),10) : parseInt(m[1],10)
      const d = m[2].startsWith('M') ? -parseInt(m[2].slice(1),10) : parseInt(m[2],10)
      details.temperature = `${t}°C / ${d}°C`
    }

    // Pressure
    const qnh = parts.find(p => /^Q\d{4}$/.test(p))
    const alt = parts.find(p => /^A\d{4}$/.test(p))
    if (qnh) {
      details.pressure = `${parseInt(qnh.slice(1),10)} hPa`
    } else if (alt) {
      const val = (parseInt(alt.slice(1),10) / 100).toFixed(2)
      details.pressure = `${val} inHg`
    }

    return details
  }

    // Last resort: only use raw summary if it is not JSON-like nor coded METAR
    if (raw && !looksJsonLike(raw) && !looksCodedMetar(raw)) {
      return raw
    }

    return ''
  }

  const handleDecode = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    try {
      const decoded = await weatherService.decodeWeather(input.trim(), type)
      // If backend lacks details, parse them client-side from the raw input
      const parsedDetails = decoded?.decoded?.details && Object.keys(decoded.decoded.details).length > 0
        ? decoded.decoded.details
        : parseMetarDetails(input)

      const ensured = {
        ...decoded,
        decoded: {
          ...(decoded?.decoded || {}),
          details: parsedDetails,
          summary: buildPlainSummary({ ...decoded, decoded: { ...(decoded?.decoded || {}), details: parsedDetails } })
        }
      }
      setResult(ensured)
    } catch (error) {
      // Offline/local fallback: try to parse METAR locally into English
      if (type === 'metar') {
        const localDetails = parseMetarDetails(input)
        const localRes = { success: true, decoded: { details: localDetails } }
        const localSummary = buildPlainSummary(localRes)
        setResult({
          success: true,
          decoded: {
            details: localDetails,
            summary: localSummary
          }
        })
      } else {
        setResult({ success: false, error: 'Failed to decode: ' + (error?.message || 'Unknown error') })
      }
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
                  <p className="text-sm text-slate-700 leading-relaxed">{buildPlainSummary(result)}</p>
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