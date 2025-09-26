import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

// Components
import Dashboard from './components/Dashboard'
import FlightBriefing from './components/FlightBriefing'
import WeatherDecoder from './components/WeatherDecoder'
import WeatherCharts from './components/WeatherCharts'
import TemperatureTrendAnalysis from './components/TemperatureTrendAnalysis.jsx'
import WindSpeedTrendAnalysis from './components/WindSpeedTrendAnalysis.jsx'
import ConditionSeverityDistribution from './components/ConditionSeverityDistribution.jsx'
import WindDirectionFrequencyAnalysis from './components/WindDirectionFrequencyAnalysis.jsx'
import WeatherUtils from './components/WeatherUtils.jsx'
import Navigation from './components/Navigation'

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Swapped content per requirement */}
          <Route path="/dashboard" element={<FlightBriefing />} />
          <Route path="/flight-briefing" element={<Dashboard />} />
          <Route path="/decoder" element={<WeatherDecoder />} />
          <Route path="/charts" element={<WeatherCharts />} />
          {/* Weather Utils landing and subpages */}
          <Route path="/weather-utils" element={<WeatherUtils />} />
          {/* Decoder deep links */}
          <Route path="/metar-decoder" element={<WeatherDecoder initialType="metar" />} />
          <Route path="/taf-decoder" element={<WeatherDecoder initialType="taf" />} />
          <Route path="/temperature-trend-analysis" element={<TemperatureTrendAnalysis />} />
          <Route path="/wind-speed-trend-analysis" element={<WindSpeedTrendAnalysis />} />
          <Route path="/condition-severity-distribution" element={<ConditionSeverityDistribution />} />
          <Route path="/wind-direction-frequency-analysis" element={<WindDirectionFrequencyAnalysis />} />
          {/* Redirect old root and legacy /briefing to new paths */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/briefing" element={<FlightBriefing />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
