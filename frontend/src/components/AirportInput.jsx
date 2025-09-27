import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Check, X, Plane } from 'lucide-react'
import weatherService from '../services/weatherService'

const AirportInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter airport name or code",
  label = "Airport",
  required = false,
  className = "",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState(null)
  const [error, setError] = useState(null)
  const [isValid, setIsValid] = useState(false)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Handle input change with debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    setError(null)
    setIsValid(false)
    setSelectedAirport(null)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // If user typed an exact 4-letter ICAO, try to resolve directly and short-circuit
    if (/^[A-Z]{4}$/.test(newValue)) {
      resolveExactIcao(newValue)
    } else if (newValue.length >= 2) {
      // Debounce search
      debounceRef.current = setTimeout(() => {
        searchAirports(newValue)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    
    // Call parent onChange
    onChange(newValue)
  }

  // Search airports
  const searchAirports = async (query) => {
    setLoading(true)
    try {
      const response = await weatherService.searchAirports(query, 20)
      const results = Array.isArray(response.results) ? response.results : []
      // If query looks like ICAO, prioritize exact match at top
      let ordered = results
      if (/^[A-Z]{4}$/.test(query)) {
        ordered = [
          ...results.filter(r => String(r.icao).toUpperCase() === query.toUpperCase()),
          ...results.filter(r => String(r.icao).toUpperCase() !== query.toUpperCase())
        ]
      }
      if (ordered.length > 0) {
        setSuggestions(ordered)
        setShowSuggestions(true)
      } else {
        // Fallback: relaxed search using token prefixes (e.g., city name pieces)
        const tokens = String(query).toUpperCase().split(/\s+/).filter(t => t.length >= 3)
        const prefixes = Array.from(new Set([
          ...tokens.map(t => t.slice(0, 4)),
          query.toUpperCase().slice(0, 4)
        ].filter(Boolean)))

        let agg = []
        for (const p of prefixes) {
          try {
            const r = await weatherService.searchAirports(p, 15)
            const arr = Array.isArray(r.results) ? r.results : []
            agg = agg.concat(arr)
          } catch {}
        }
        // Deduplicate by ICAO
        const byIcao = new Map()
        agg.forEach(a => {
          if (a && a.icao && !byIcao.has(a.icao)) byIcao.set(a.icao, a)
        })
        let relaxed = Array.from(byIcao.values())

        // Rank by simple similarity: name/city contains token or startsWith
        const Q = String(query).toUpperCase()
        const score = (a) => {
          const name = String(a.name || '').toUpperCase()
          const city = String(a.city || '').toUpperCase()
          const icao = String(a.icao || '').toUpperCase()
          let s = 0
          if (icao === Q) s += 100
          if (name.startsWith(Q) || city.startsWith(Q)) s += 40
          if (name.includes(Q) || city.includes(Q)) s += 20
          tokens.forEach(t => {
            if (name.startsWith(t) || city.startsWith(t)) s += 10
            else if (name.includes(t) || city.includes(t)) s += 5
          })
          return -s // negative for ascending sort then reverse
        }
        relaxed.sort((a, b) => score(a) - score(b))
        relaxed = relaxed.slice(0, 20)

        setSuggestions(relaxed)
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Airport search error:', err)
      setError('Failed to search airports')
    } finally {
      setLoading(false)
    }
  }

  // Resolve an exact ICAO via backend details endpoint; mark valid even if not in suggestions
  const resolveExactIcao = async (icao) => {
    setLoading(true)
    try {
      const resp = await weatherService.getAirportDetails(icao)
      const airport = resp?.airport || resp // backend sometimes returns { success, airport }
      if (airport && airport.icao) {
        setSelectedAirport(airport)
        setIsValid(true)
        setError(null)
        setSuggestions([airport])
        setShowSuggestions(true)
      } else {
        // Even if details not found, allow user to proceed with typed ICAO
        setIsValid(true)
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (e) {
      // Allow freeform ICAO entry; user can still submit
      setIsValid(true)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle airport selection
  const handleAirportSelect = (airport) => {
    console.log('Airport selected:', airport)
    setInputValue(airport.icao)
    setSelectedAirport(airport)
    setShowSuggestions(false)
    setIsValid(true)
    setError(null)
    onChange(airport.icao)
    
    // Focus back to input after selection
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Handle mouse down on suggestion to prevent blur
  const handleSuggestionMouseDown = (e) => {
    e.preventDefault() // Prevent input from losing focus
  }

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle input blur
  const handleBlur = (e) => {
    // Check if the blur is caused by clicking on a suggestion
    const relatedTarget = e.relatedTarget
    if (relatedTarget && suggestionsRef.current && suggestionsRef.current.contains(relatedTarget)) {
      // Don't hide suggestions if clicking on a suggestion
      return
    }
    
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false)
    }, 150)
  }

  // Clear input
  const handleClear = () => {
    setInputValue('')
    setSelectedAirport(null)
    setSuggestions([])
    setShowSuggestions(false)
    setIsValid(false)
    setError(null)
    onChange('')
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      // If no suggestions are shown, allow normal Enter behavior for form submission
      return
    }

    const currentIndex = suggestions.findIndex(s => s.icao === selectedAirport?.icao)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0
        setSelectedAirport(suggestions[nextIndex])
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1
        setSelectedAirport(suggestions[prevIndex])
        break
      case 'Enter':
        e.preventDefault()
        if (selectedAirport) {
          handleAirportSelect(selectedAirport)
        } else if (suggestions.length > 0) {
          // If no airport is selected but suggestions exist, select the first one
          handleAirportSelect(suggestions[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedAirport(null)
        break
      case 'Tab':
        // Allow Tab to select the highlighted airport
        if (selectedAirport) {
          e.preventDefault()
          handleAirportSelect(selectedAirport)
        }
        break
    }
  }

  // Get match type icon
  const getMatchTypeIcon = (matchType) => {
    switch (matchType) {
      case 'icao': return '🛫'
      case 'iata': return '✈️'
      case 'name': return '🏢'
      case 'city': return '🏙️'
      default: return '🔍'
    }
  }

  // Get match type color
  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case 'icao': return 'text-blue-600 bg-blue-50'
      case 'iata': return 'text-green-600 bg-green-50'
      case 'name': return 'text-purple-600 bg-purple-50'
      case 'city': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-54 max-w-sm h-12 px-4 pr-20 text-base font-medium bg-white/80 border-2 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm ${
              error ? 'border-red-300 focus:border-red-400 focus:ring-red-200/50' : 
              isValid ? 'border-green-300 focus:border-green-400 focus:ring-green-200/50' : 
              'border-slate-200'
            }`}
            placeholder={placeholder}
            maxLength={20}
            required={required}
          />
          
          {/* Input icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 space-x-4">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            
            {inputValue && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
            
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                {isValid ? 'ICAO' : 'AUTO'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected airport info */}
        {selectedAirport && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-green-800">
                  {selectedAirport.name}
                </div>
                <div className="text-xs text-green-600">
                  {selectedAirport.city}, {selectedAirport.country} • <span className="font-mono font-semibold">{selectedAirport.icao}</span>
                  {selectedAirport.iata && ` (${selectedAirport.iata})`}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  ✓ ICAO code pasted to input field
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {suggestions.map((airport, index) => (
              <div
                key={airport.icao}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Clicking on airport:', airport.icao)
                  handleAirportSelect(airport)
                }}
                onMouseDown={handleSuggestionMouseDown}
                className={`p-3 cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-blue-50 transition-colors group ${
                  selectedAirport?.icao === airport.icao ? 'bg-blue-50' : ''
                }`}
                title="Click to paste ICAO code"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Plane className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                        {airport.icao}
                      </span>
                      {airport.iata && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {airport.iata}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getMatchTypeColor(airport.matchType)}`}>
                        {getMatchTypeIcon(airport.matchType)} {airport.matchType}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-700 truncate">
                      {airport.name}
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      {airport.city}, {airport.country}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <div className="text-xs text-slate-400">
                      {airport.score}%
                    </div>
                    <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to paste
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4">
            <div className="text-center text-slate-500">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No airports found for "{inputValue}"</p>
              <p className="text-xs mt-1">Try entering a city name, airport name, or ICAO/IATA code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AirportInput
