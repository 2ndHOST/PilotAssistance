import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Plane, Cloud, Radar, Activity, TrendingUp, Plus, X, Briefcase, FileText, BarChart3, Settings } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  const [showQuickActions, setShowQuickActions] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/briefing', label: 'Flight Briefing', icon: Plane },
    { path: '/decoder', label: 'Weather Decoder', icon: Cloud },
    { path: '/charts', label: 'Weather Trends', icon: TrendingUp },
  ]

  const quickActions = [
    { label: 'New Flight Briefing', icon: Briefcase, action: () => console.log('New briefing') },
    { label: 'Decode Weather', icon: FileText, action: () => console.log('Decode weather') },
    { label: 'Weather Analysis', icon: BarChart3, action: () => console.log('Weather analysis') },
    { label: 'Settings', icon: Settings, action: () => console.log('Settings') },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm" style={{ backgroundColor: '#624CAB' }}>
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Pilot Assistant
              </span>
              <div className="text-xs text-slate-500 font-medium">for Pilots</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:shadow-sm'
                    }
                  `}
                  style={isActive ? { backgroundColor: '#7189FF' } : {}}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center justify-center w-12 h-12 rounded-xl text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#758ECD' }}
              >
                {showQuickActions ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 top-14 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 py-3 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quick Actions
                  </div>
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action()
                        setShowQuickActions(false)
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/80 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#C1CEFE' }}>
                        <action.icon className="h-4 w-4" style={{ color: '#624CAB' }} />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-3 rounded-full px-4 py-2 border" style={{ backgroundColor: '#A0DDFF', borderColor: '#C1CEFE' }}>
              <div className="relative">
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 h-2.5 w-2.5 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#624CAB' }}>Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation