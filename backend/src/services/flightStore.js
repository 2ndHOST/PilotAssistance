// In-memory flight store to track current and recent flights

const MAX_RECENT = 20;

let currentFlight = null;
let recentFlights = [];
let recentSearches = [];
const MAX_RECENT_SEARCHES = 20;

function haversineDistanceKm(a, b) {
  if (!a || !b) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

function generateAltitudeWeather(weatherSeverity = 'normal') {
  const levels = ['FL180', 'FL240', 'FL300', 'FL360'];
  const baseTemp = -20; // Base temperature at FL180
  const tempDrop = 2; // Temperature drops 2°C per 1000ft
  
  return levels.map((level) => {
    const altitude = parseInt(level.replace('FL', '')) * 100; // Convert to feet
    const temp = baseTemp - ((altitude - 18000) / 1000) * tempDrop;
    const windSpeed = 25 + Math.random() * 50; // Random wind speed 25-75 kt
    const windDir = Math.floor(Math.random() * 360);
    
    // Determine severity based on flight weather status
    let severity = 'normal';
    let turbulence = 'Light';
    
    if (weatherSeverity === 'critical') {
      severity = Math.random() > 0.5 ? 'critical' : 'caution';
      turbulence = severity === 'critical' ? 'Severe' : 'Moderate';
    } else if (weatherSeverity === 'caution') {
      severity = Math.random() > 0.3 ? 'caution' : 'normal';
      turbulence = severity === 'caution' ? 'Moderate' : 'Light';
    }
    
    return {
      level,
      temperature: Math.round(temp),
      wind: `${windDir}° at ${Math.round(windSpeed)}kt`,
      conditions: severity === 'critical' ? 'Severe turbulence, icing possible' : 
                 severity === 'caution' ? 'Moderate turbulence' : 'Clear air',
      turbulence,
      severity
    };
  });
}

function updateFromBriefing(briefing) {
  try {
    const origin = briefing?.route?.origin;
    const destination = briefing?.route?.destination;
    if (!origin || !destination) return;

    const originAirport = briefing.airports?.[origin]?.details || briefing.airports?.[origin]?.airport;
    const destAirport = briefing.airports?.[destination]?.details || briefing.airports?.[destination]?.airport;

    const originCoords = originAirport && originAirport.lat && originAirport.lon
      ? { lat: Number(originAirport.lat), lon: Number(originAirport.lon) }
      : null;
    const destCoords = destAirport && destAirport.lat && destAirport.lon
      ? { lat: Number(destAirport.lat), lon: Number(destAirport.lon) }
      : null;

    const distanceKm = haversineDistanceKm(originCoords, destCoords);

    // Rough estimate for time if not provided: cruise 800 km/h incl. taxi buffer
    const estimatedTimeMin = distanceKm ? Math.round((distanceKm / 800) * 60 + 10) : null;
    const flightTime = briefing.summary?.estimatedFlightTime ||
      (estimatedTimeMin != null ? `${Math.floor(estimatedTimeMin / 60)}h ${estimatedTimeMin % 60}m` : '—');

    const routeAirports = [];
    // Include origin and destination with metar severity if known
    ['origin', 'destination'].forEach((key) => {
      const icao = key === 'origin' ? origin : destination;
      const details = briefing.airports?.[icao]?.details || briefing.airports?.[icao]?.airport;
      const metar = briefing.airports?.[icao]?.metar;
      const coord = details && details.lat != null && details.lon != null
        ? { lat: Number(details.lat), lon: Number(details.lon) }
        : null;
      routeAirports.push({
        icao,
        lat: coord?.lat,
        lon: coord?.lon,
        conditions: metar?.decoded?.summary,
        severity: metar?.severity || { level: 'unknown' }
      });
    });

    const weatherSeverity = briefing.summary?.worstSeverity || 'normal';
    // record search
    addSearch({ departure: origin, destination });
    const weatherStatus = {
      worstSeverity: weatherSeverity,
    };

    currentFlight = {
      departure: origin,
      destination,
      flightTime,
      distanceKm: distanceKm != null ? distanceKm : null,
      routeCoordinates: [
        originCoords ? [originCoords.lat, originCoords.lon] : null,
        destCoords ? [destCoords.lat, destCoords.lon] : null,
      ].filter(Boolean),
      routeAirports,
      weatherStatus,
      altitudeWeather: generateAltitudeWeather(weatherSeverity),
      updatedAt: new Date().toISOString(),
    };

    // Update recent flights list
    recentFlights.unshift({
      id: `${Date.now()}`,
      departure: origin,
      destination,
      timestamp: new Date().toISOString(),
      status: 'completed',
    });
    if (recentFlights.length > MAX_RECENT) {
      recentFlights = recentFlights.slice(0, MAX_RECENT);
    }
  } catch (e) {
    // fail silently for now
  }
}

function updateFromSimpleBriefing(payload) {
  const { departure, destination, flightTime, distanceKm, routeCoordinates, routeAirports, weatherStatus } = payload || {};
  if (!departure || !destination) return;
  const safeDistance = (typeof distanceKm === 'number' && isFinite(distanceKm)) ? Math.round(distanceKm) : null;
  const weatherSeverity = weatherStatus?.worstSeverity || 'normal';
  addSearch({ departure, destination });

  currentFlight = {
    departure: String(departure).toUpperCase(),
    destination: String(destination).toUpperCase(),
    flightTime: flightTime || '—',
    distanceKm: safeDistance,
    routeCoordinates: Array.isArray(routeCoordinates) ? routeCoordinates.filter(Boolean) : [],
    routeAirports: Array.isArray(routeAirports) ? routeAirports : [],
    weatherStatus: weatherStatus || { worstSeverity: 'unknown' },
    altitudeWeather: generateAltitudeWeather(weatherSeverity),
    updatedAt: new Date().toISOString(),
  };

  recentFlights.unshift({
    id: `${Date.now()}`,
    departure: currentFlight.departure,
    destination: currentFlight.destination,
    timestamp: new Date().toISOString(),
    status: 'completed',
  });
  if (recentFlights.length > MAX_RECENT) {
    recentFlights = recentFlights.slice(0, MAX_RECENT);
  }
}

function setMockIfEmpty() {
  if (currentFlight) return;
  const now = new Date();
  currentFlight = {
    departure: 'KJFK',
    destination: 'KLAX',
    flightTime: '5h 45m',
    distanceKm: 3983,
    routeCoordinates: [
      [40.6413, -73.7781],
      [33.9416, -118.4085],
    ],
    routeAirports: [
      { icao: 'KJFK', lat: 40.6413, lon: -73.7781, severity: { level: 'normal' }, conditions: 'VFR' },
      { icao: 'KLAX', lat: 33.9416, lon: -118.4085, severity: { level: 'caution' }, conditions: 'MVFR' },
    ],
    weatherStatus: { worstSeverity: 'caution' },
    altitudeWeather: generateAltitudeWeather('caution'),
    updatedAt: now.toISOString(),
  };
  recentFlights = [
    { id: `${now.getTime() - 7200000}`, departure: 'KJFK', destination: 'KLAX', timestamp: new Date(now.getTime() - 7200000).toISOString(), status: 'completed' },
    { id: `${now.getTime() - 18000000}`, departure: 'KORD', destination: 'KDEN', timestamp: new Date(now.getTime() - 18000000).toISOString(), status: 'completed' },
  ];
}

function getCurrentFlight() {
  if (!currentFlight) setMockIfEmpty();
  return currentFlight;
}

function getRecentFlights() {
  if (!recentFlights || recentFlights.length === 0) setMockIfEmpty();
  return recentFlights;
}

function addSearch({ departure, destination }) {
  if (!departure || !destination) return;
  const dep = String(departure).toUpperCase();
  const dest = String(destination).toUpperCase();
  // remove existing same pair
  recentSearches = recentSearches.filter(s => !(s.departure === dep && s.destination === dest));
  recentSearches.unshift({ id: `${Date.now()}`, departure: dep, destination: dest, timestamp: new Date().toISOString() });
  if (recentSearches.length > MAX_RECENT_SEARCHES) {
    recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
  }
}

function getRecentSearches() {
  return recentSearches;
}

module.exports = {
  updateFromBriefing,
  updateFromSimpleBriefing,
  getCurrentFlight,
  getRecentFlights,
  getRecentSearches,
};


