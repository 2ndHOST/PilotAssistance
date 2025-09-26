import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const FlightMap = ({ route, airports = [], enroutePoints = [], windPoints = [], height = '400px' }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const getAirportName = (icao) => {
    const airportNames = {
      'VOBL': 'Bangalore',
      'VABB': 'Mumbai', 
      'VECC': 'Kolkata',
      'VIDP': 'Delhi',
      'VOMM': 'Chennai',
      'VAGO': 'Goa',
      'VOCB': 'Coimbatore',
      'VOTV': 'Thiruvananthapuram',
      'VOPB': 'Port Blair',
      'VEGT': 'Guwahati',
      'KJFK': 'New York JFK',
      'KLAX': 'Los Angeles',
      'KORD': 'Chicago O\'Hare',
      'KDEN': 'Denver',
      'KBOS': 'Boston',
      'KSEA': 'Seattle',
      'KDFW': 'Dallas Fort Worth',
      'KATL': 'Atlanta',
      'KMIA': 'Miami',
      'KLAS': 'Las Vegas'
    }
    return airportNames[icao] || icao
  }

  // Get coords for an ICAO from airports prop (each item can include lat/lon)
  const getCoordsForIcao = (icao) => {
    const a = airports.find(x => x.icao === icao && x.lat != null && x.lon != null)
    if (!a) return null
    return [Number(a.lat), Number(a.lon)]
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'caution': return '#f59e0b'
      case 'normal': return '#10b981'
      default: return '#6b7280'
    }
  }

  const createCustomIcon = (severity, isOrigin = false, isDestination = false) => {
    const color = getSeverityColor(severity)
    let iconHtml = `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      ">
    `
    
    if (isOrigin) iconHtml += '🛫'
    else if (isDestination) iconHtml += '🛬'
    else iconHtml += '✈️'
    
    iconHtml += '</div>'

    return L.divIcon({
      html: iconHtml,
      className: 'custom-airport-marker',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4) // Center of US
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    
    // Clear existing non-tile layers before re-rendering
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer)
      }
    })

    if (!route || !route.origin || !route.destination) return

    const markers = []
    const routeCoordinates = []

    // Add origin marker
    const originCoords = getCoordsForIcao(route.origin)
    if (originCoords) {
      const originMarker = L.marker(originCoords, {
        icon: createCustomIcon('normal', true, false)
      })
        .bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-lg">${route.origin}</h3>
            <p class="text-sm text-gray-600">Origin Airport</p>
          </div>
        `)
        .addTo(map)
      
      markers.push(originMarker)
      routeCoordinates.push(originCoords)
    } else {
      console.warn(`No coordinates found for origin airport: ${route.origin}`)
    }

    // Add destination marker
    const destCoords = getCoordsForIcao(route.destination)
    if (destCoords) {
      const destMarker = L.marker(destCoords, {
        icon: createCustomIcon('normal', false, true)
      })
        .bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-lg">${route.destination}</h3>
            <p class="text-sm text-gray-600">Destination Airport</p>
          </div>
        `)
        .addTo(map)
      
      markers.push(destMarker)
      routeCoordinates.push(destCoords)
    } else {
      console.warn(`No coordinates found for destination airport: ${route.destination}`)
    }

    // Add alternate airports
    if (route.alternates && route.alternates.length > 0) {
      route.alternates.forEach(alt => {
        const altCoords = getCoordsForIcao(alt)
        if (alt && altCoords) {
          const altMarker = L.marker(altCoords, {
            icon: createCustomIcon('caution')
          })
            .bindPopup(`
              <div class="text-center">
                <h3 class="font-bold text-lg">${alt}</h3>
                <p class="text-sm text-gray-600">Alternate Airport</p>
              </div>
            `)
            .addTo(map)
          
          markers.push(altMarker)
        }
      })
    }

    // Add airports with weather data
    if (airports && airports.length > 0) {
      airports.forEach(airport => {
        const coords = (airport.lat != null && airport.lon != null) ? [Number(airport.lat), Number(airport.lon)] : null
        if (coords && !routeCoordinates.some(coord => coord[0] === coords[0] && coord[1] === coords[1])) {
          const marker = L.marker(coords, {
            icon: createCustomIcon(airport.severity?.level || 'normal')
          })
            .bindPopup(`
              <div class="text-center max-w-xs">
                <h3 class="font-bold text-lg">${airport.icao}</h3>
                <p class="text-sm text-gray-600 mb-2">${airport.severity?.description || 'Weather conditions'}</p>
                ${airport.conditions ? `<p class="text-xs text-gray-500">${airport.conditions}</p>` : ''}
              </div>
            `)
            .addTo(map)
          
          markers.push(marker)
        }
      })
    }

    // Draw flight path
    if (routeCoordinates.length >= 2) {
      console.log('Drawing flight path between:', routeCoordinates)
      
      const flightPath = L.polyline(routeCoordinates, {
        color: '#0ea5e9',
        weight: 4,
        opacity: 0.9,
        dashArray: '15, 10'
      }).addTo(map)
      
      // Add arrow to show direction
      const midpoint = [
        (routeCoordinates[0][0] + routeCoordinates[1][0]) / 2,
        (routeCoordinates[0][1] + routeCoordinates[1][1]) / 2
      ]
      
      L.marker(midpoint, {
        icon: L.divIcon({
          html: '<div style="font-size: 24px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">✈️</div>',
          className: 'flight-direction-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map)
      
      // Add distance information
      const distance = map.distance(routeCoordinates[0], routeCoordinates[1])
      const distanceKm = Math.round(distance / 1000)
      
      L.marker(midpoint, {
        icon: L.divIcon({
          html: `<div style="background: rgba(14, 165, 233, 0.9); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap;">${distanceKm} km</div>`,
          className: 'flight-distance-marker',
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        })
      }).addTo(map)
    } else {
      console.warn('Not enough coordinates to draw flight path:', routeCoordinates.length)
    }

    // Plot enroute sampled points with nearest METAR summaries
    if (enroutePoints && enroutePoints.length > 0) {
      enroutePoints.forEach((pt, idx) => {
        if (pt.lat != null && pt.lon != null) {
          const pcoords = [Number(pt.lat), Number(pt.lon)]
          const marker = L.circleMarker(pcoords, {
            radius: 5,
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.8
          })
          .bindPopup(`
            <div class="text-xs max-w-xs">
              <div class="font-semibold mb-1">Enroute sample ${idx + 1}</div>
              ${pt.nearestStation ? `<div class="text-slate-600">Nearest: ${pt.nearestStation}${pt.distanceNm ? ` • ${Number(pt.distanceNm).toFixed(1)} NM` : ''}</div>` : ''}
              ${pt.metarSummary ? `<div class="mt-1 text-slate-700">${pt.metarSummary}</div>` : '<div class="text-slate-500">No data</div>'}
            </div>
          `)
          .addTo(map)
          markers.push(marker)
        }
      })
    }

    // Plot winds aloft arrows/summaries
    if (windPoints && windPoints.length > 0) {
      windPoints.forEach((pt, idx) => {
        if (pt.lat != null && pt.lon != null) {
          const coords = [Number(pt.lat), Number(pt.lon)]
          const dir = Number.isFinite(Number(pt.windDirDeg)) ? Math.round(Number(pt.windDirDeg)) : null
          const speed = Number.isFinite(Number(pt.windSpeedKt)) ? Math.round(Number(pt.windSpeedKt)) : null

          const html = `
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.4)); transform: rotate(${dir != null ? dir : 0}deg);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3 L15 9 L12 7 L9 9 Z" fill="#0ea5e9"/>
                <rect x="11" y="7" width="2" height="12" fill="#0ea5e9"/>
              </svg>
            </div>
          `

          const windMarker = L.marker(coords, {
            icon: L.divIcon({
              html,
              className: 'wind-arrow-marker',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })
          })
          .bindPopup(`
            <div class="text-xs">
              <div class="font-semibold">Winds Aloft ${idx + 1}</div>
              <div class="text-slate-600">${speed != null ? `${speed} kt` : '—'}${dir != null ? ` @ ${dir}°` : ''}${pt.temperatureC != null ? ` • ${pt.temperatureC}°C` : ''}</div>
              ${pt.pressureLevelHpa ? `<div class="text-slate-500">Level: ${pt.pressureLevelHpa} hPa</div>` : ''}
            </div>
          `)
          .addTo(map)

          markers.push(windMarker)
        }
      })
    }

    // Fit map to show all markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }

  }, [route, airports, enroutePoints, windPoints])

  return (
    <div className="aviation-card overflow-hidden">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Flight Route Map
        </h3>
        {route && route.origin && route.destination && (
          <div className="mt-2">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-slate-900">{route.origin}</div>
                <div className="text-xs text-slate-500">{getAirportName(route.origin)}</div>
              </div>
              <div className="text-slate-400">→</div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">{route.destination}</div>
                <div className="text-xs text-slate-500">{getAirportName(route.destination)}</div>
              </div>
            </div>
            {route.alternates && route.alternates.filter(alt => alt).length > 0 && (
              <div className="mt-2 text-xs text-slate-500 text-center">
                Alternates: {route.alternates.filter(alt => alt).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div 
        ref={mapRef}
        style={{ height }}
        className="w-full"
      />
      
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Caution</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical</span>
            </div>
          </div>
          <span>Click markers for details</span>
        </div>
      </div>
    </div>
  )
}

export default FlightMap