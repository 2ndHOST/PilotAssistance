const axios = require('axios');
const WeatherParser = require('./weatherParser');
require('dotenv').config();

class WeatherService {
  constructor() {
    this.parser = new WeatherParser();
    this.cache = new Map();
    this.cacheTimeout = parseInt(process.env.WEATHER_CACHE_TTL) || 5 * 60 * 1000; // 5 minutes
    this.failedAPIs = new Set(); // Track failed APIs to avoid retrying
    
    // API Configuration
    this.avwxApiKey = process.env.AVWX_API_KEY;
    this.avwxBaseUrl = process.env.AVWX_BASE_URL || 'https://avwx.rest/api';
    this.checkwxApiKey = process.env.CHECKWX_API_KEY;
    this.checkwxBaseUrl = process.env.CHECKWX_BASE_URL || 'https://api.checkwx.com/v1';
    this.aeroDataBoxApiKey = process.env.AERODATABOX_API_KEY;
    this.aeroDataBoxBaseUrl = process.env.AERODATABOX_BASE_URL || 'https://aerodatabox.p.rapidapi.com';
    
    // Log API configuration status
    this.logApiStatus();
    
    // Mock data for development/demo purposes - each airport has unique weather
    this.mockData = {
      // JFK - Good conditions with some wind
      'KJFK': {
        metar: 'METAR KJFK 121251Z 28014G20KT 10SM FEW250 24/18 A3000 RMK AO2 SLP158 T02440183=',
        taf: 'TAF KJFK 121120Z 1212/1318 28015G25KT P6SM FEW250 FM121600 30012KT P6SM SCT250 FM130000 32008KT P6SM BKN250='
      },
      // LGA - Rain and low visibility
      'KLGA': {
        metar: 'METAR KLGA 121251Z 09022G28KT 4SM -RA BKN008 OVC015 18/16 A2992 RMK AO2 SLP132 P0001 T01830161=',
        taf: 'TAF KLGA 121120Z 1212/1318 09025G35KT 3SM -RA BKN008 OVC020 FM121800 12015KT 5SM BKN015 OVC030='
      },
      // ORD - Severe thunderstorms
      'KORD': {
        metar: 'METAR KORD 121251Z 27035G45KT 1/2SM +TSRA BKN008 OVC020 CB 15/14 A2965 RMK AO2 TSB35 SLP043 P0015 T01500144=',
        taf: 'TAF KORD 121120Z 1212/1318 27040G50KT 1/4SM +TSRA BKN005 OVC015 CB TEMPO 1212/1216 1/8SM +TSRA FG BKN002='
      },
      // BOS - Fog and low ceilings
      'KBOS': {
        metar: 'METAR KBOS 121251Z 00000KT 1/4SM FG BKN002 OVC004 12/12 A3015 RMK AO2 SLP205 T01220122=',
        taf: 'TAF KBOS 121120Z 1212/1318 00000KT 1/4SM FG BKN002 OVC004 FM121800 08008KT 2SM BR BKN010 OVC020='
      },
      // SEA - Overcast with light rain
      'KSEA': {
        metar: 'METAR KSEA 121251Z 24008KT 6SM -RA OVC015 14/12 A2998 RMK AO2 SLP145 P0001 T01440122=',
        taf: 'TAF KSEA 121120Z 1212/1318 24010KT 6SM -RA OVC015 FM121800 25012KT 8SM OVC020='
      },
      // DEN - Clear skies, high altitude
      'KDEN': {
        metar: 'METAR KDEN 121251Z 32012KT 10SM CLR 08/02 A3021 RMK AO2 SLP218 T00830022=',
        taf: 'TAF KDEN 121120Z 1212/1318 32015KT P6SM CLR FM121800 30010KT P6SM SCT250='
      },
      // LAX - Marine layer, overcast
      'KLAX': {
        metar: 'METAR KLAX 121251Z 25006KT 3SM BR OVC006 18/16 A2995 RMK AO2 SLP135 T01830161=',
        taf: 'TAF KLAX 121120Z 1212/1318 25008KT 3SM BR OVC006 FM121800 27010KT 6SM OVC010='
      },
      // MIA - Tropical conditions, scattered storms
      'KMIA': {
        metar: 'METAR KMIA 121251Z 12015G22KT 8SM SCT025 BKN040 28/24 A3002 RMK AO2 SLP168 T02830244=',
        taf: 'TAF KMIA 121120Z 1212/1318 12018G25KT P6SM SCT025 BKN040 TEMPO 1212/1216 3SM TSRA BKN015='
      },
      // International airports
      'EGLL': {
        metar: 'METAR EGLL 121320Z AUTO 25012KT 9999 FEW035 SCT250 16/11 Q1016 NOSIG=',
        taf: 'TAF EGLL 121100Z 1212/1318 25015KT 9999 SCT035 BECMG 1216/1218 27018G30KT='
      },
      'LFPG': {
        metar: 'METAR LFPG 121330Z 27008KT CAVOK 19/12 Q1018 NOSIG=',
        taf: 'TAF LFPG 121100Z 1212/1318 27010KT CAVOK TEMPO 1218/1222 25015G25KT='
      },
      // Additional airports for variety
      'VIPA': {
        metar: 'METAR VIPA 121251Z 27012KT 10SM FEW035 SCT100 22/16 A3012 RMK AO2 SLP201 T02220161=',
        taf: 'TAF VIPA 121120Z 1212/1318 27015KT P6SM FEW035 SCT100 FM121800 30012KT P6SM SCT250='
      },
      'VAPP': {
        metar: 'METAR VAPP 121251Z 28010KT 8SM SCT015 BKN025 20/14 A3008 RMK AO2 SLP185 T02000139=',
        taf: 'TAF VAPP 121120Z 1212/1318 28012KT P6SM SCT015 BKN025 FM121800 30010KT P6SM SCT020='
      },
      // Indian airports
      'VIDP': {
        metar: 'METAR VIDP 121251Z 32015G25KT 6SM HZ SCT020 BKN040 28/18 A2995 RMK AO2 SLP135 T02830183=',
        taf: 'TAF VIDP 121120Z 1212/1318 32018G30KT 6SM HZ SCT020 BKN040 FM121800 30012KT P6SM SCT025='
      }
    };
    
    // NOTAM mock data - airport-specific
    this.mockNotams = {
      'KJFK': [
        {
          id: 'NOTAM-001',
          type: 'runway',
          severity: 'caution',
          message: 'RWY 04L/22R CLSD FOR MAINTENANCE 1300-1700 DAILY',
          startTime: '2024-01-15T13:00:00Z',
          endTime: '2024-01-15T17:00:00Z',
          location: 'KJFK'
        }
      ],
      'KLGA': [
        {
          id: 'NOTAM-002',
          type: 'navaid',
          severity: 'normal',
          message: 'ILS RWY 04 GP U/S',
          startTime: '2024-01-15T08:00:00Z',
          endTime: '2024-01-16T20:00:00Z',
          location: 'KLGA'
        }
      ],
      'KORD': [
        {
          id: 'NOTAM-003',
          type: 'runway',
          severity: 'critical',
          message: 'RWY 10C/28C CLSD DUE TO SNOW REMOVAL OPS',
          startTime: '2024-01-15T06:00:00Z',
          endTime: '2024-01-15T18:00:00Z',
          location: 'KORD'
        },
        {
          id: 'NOTAM-004',
          type: 'facility',
          severity: 'caution',
          message: 'TWR FREQ 120.15 U/S USE 121.9',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T16:00:00Z',
          location: 'KORD'
        }
      ],
      'KBOS': [
        {
          id: 'NOTAM-005',
          type: 'runway',
          severity: 'caution',
          message: 'RWY 04L/22R WET CONDITIONS EXPECTED',
          startTime: '2024-01-15T12:00:00Z',
          endTime: '2024-01-15T20:00:00Z',
          location: 'KBOS'
        }
      ],
      'KSEA': [
        {
          id: 'NOTAM-006',
          type: 'runway',
          severity: 'normal',
          message: 'RWY 16L/34R CONSTRUCTION EQUIPMENT ADJACENT',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T17:00:00Z',
          location: 'KSEA'
        }
      ],
      'KDEN': [
        {
          id: 'NOTAM-007',
          type: 'runway',
          severity: 'normal',
          message: 'RWY 16L/34R HIGH DENSITY ALTITUDE OPERATIONS',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T18:00:00Z',
          location: 'KDEN'
        }
      ],
      'KLAX': [
        {
          id: 'NOTAM-008',
          type: 'runway',
          severity: 'caution',
          message: 'RWY 25L/07R MARINE LAYER EXPECTED',
          startTime: '2024-01-15T14:00:00Z',
          endTime: '2024-01-15T22:00:00Z',
          location: 'KLAX'
        }
      ],
      'KMIA': [
        {
          id: 'NOTAM-009',
          type: 'runway',
          severity: 'normal',
          message: 'RWY 08L/26R TROPICAL WEATHER PATTERN',
          startTime: '2024-01-15T11:00:00Z',
          endTime: '2024-01-15T19:00:00Z',
          location: 'KMIA'
        }
      ],
      'VIPA': [
        {
          id: 'NOTAM-010',
          type: 'runway',
          severity: 'normal',
          message: 'RWY 09/27 MAINTENANCE VEHICLES ON MOVEMENT AREA',
          startTime: '2024-01-15T13:00:00Z',
          endTime: '2024-01-15T15:00:00Z',
          location: 'VIPA'
        }
      ],
      'VAPP': [
        {
          id: 'NOTAM-011',
          type: 'runway',
          severity: 'caution',
          message: 'RWY 12/30 WIND SHEAR ADVISORY IN EFFECT',
          startTime: '2024-01-15T12:00:00Z',
          endTime: '2024-01-15T18:00:00Z',
          location: 'VAPP'
        }
      ],
      'VIDP': [
        {
          id: 'NOTAM-012',
          type: 'runway',
          severity: 'normal',
          message: 'RWY 09/27 MAINTENANCE VEHICLES ON MOVEMENT AREA',
          startTime: '2024-01-15T13:00:00Z',
          endTime: '2024-01-15T15:00:00Z',
          location: 'VIDP'
        }
      ]
    };
  }

  /**
   * Get METAR data for airport
   */
  async getMetar(icaoCode) {
    const cacheKey = `metar_${icaoCode}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let metarText;
      
      // Always try real APIs first if keys are available
      if (this.avwxApiKey || this.checkwxApiKey) {
        try {
          metarText = await this.fetchMetarFromAPI(icaoCode);
          console.log(`✅ Got REAL METAR data for ${icaoCode}`);
        } catch (error) {
          console.log(`⚠️  Real API failed for ${icaoCode}, using mock data:`, error.message);
          metarText = this.getMockMetar(icaoCode);
        }
      } else {
        console.log(`ℹ️  No API keys - using mock METAR data for ${icaoCode}`);
        metarText = this.getMockMetar(icaoCode);
      }

      const result = this.parser.parseMetar(metarText);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get METAR for ${icaoCode}: ${error.message}`);
    }
  }

  /**
   * Get TAF data for airport
   */
  async getTaf(icaoCode) {
    const cacheKey = `taf_${icaoCode}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let tafText;
      
      // Always try real APIs first if keys are available
      if (this.avwxApiKey || this.checkwxApiKey) {
        try {
          tafText = await this.fetchTafFromAPI(icaoCode);
          console.log(`✅ Got REAL TAF data for ${icaoCode}`);
        } catch (error) {
          console.log(`⚠️  Real API failed for ${icaoCode}, using mock data:`, error.message);
          tafText = this.getMockTaf(icaoCode);
        }
      } else {
        console.log(`ℹ️  No API keys - using mock TAF data for ${icaoCode}`);
        tafText = this.getMockTaf(icaoCode);
      }

      const result = this.parser.parseTaf(tafText);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get TAF for ${icaoCode}: ${error.message}`);
    }
  }

  /**
   * Get NOTAMs for airport
   */
  async getNotams(icaoCode) {
    const cacheKey = `notams_${icaoCode}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let notams;
      
      // Always try real APIs first if keys are available
      if (this.avwxApiKey || this.checkwxApiKey) {
        try {
          notams = await this.fetchNotamsFromAPI(icaoCode);
          console.log(`✅ Got REAL NOTAM data for ${icaoCode}`);
        } catch (error) {
          console.log(`⚠️  Real API failed for ${icaoCode}, using mock data:`, error.message);
          notams = this.getMockNotams(icaoCode);
        }
      } else {
        console.log(`ℹ️  No API keys - using mock NOTAM data for ${icaoCode}`);
        notams = this.getMockNotams(icaoCode);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: notams,
        timestamp: Date.now()
      });
      
      return notams;
    } catch (error) {
      throw new Error(`Failed to get NOTAMs for ${icaoCode}: ${error.message}`);
    }
  }

  /**
   * Get comprehensive weather briefing for flight route
   */
  async getFlightBriefing(route) {
    const { origin, destination, alternates = [] } = route;
    const airports = [origin, destination, ...alternates];
    
    try {
      const briefing = {
        route,
        airports: {},
        summary: {
          worstSeverity: 'normal',
          criticalAlerts: [],
          recommendations: []
        },
        routeWeather: { points: [] },
        timestamp: new Date().toISOString()
      };

      // Fetch airport details and weather data for all airports in parallel
      const weatherPromises = airports.map(async (icao) => {
        const [airport, metar, taf, notams] = await Promise.all([
          this.getAirportDetails(icao).catch(() => null),
          this.getMetar(icao),
          this.getTaf(icao),
          this.getNotams(icao)
        ]);

        return { icao, airport, metar, taf, notams };
      });

      const airportData = await Promise.all(weatherPromises);

      // Process each airport's data
      airportData.forEach(({ icao, airport, metar, taf, notams }) => {
        briefing.airports[icao] = {
          airport,
          metar,
          taf,
          notams,
          role: this.getAirportRole(icao, route)
        };

        // Update worst severity
        if (metar.success && this.parser.compareSeverity(metar.severity.level, briefing.summary.worstSeverity) > 0) {
          briefing.summary.worstSeverity = metar.severity.level;
        }

        // Collect critical alerts
        if (metar.success && metar.severity.level === 'critical') {
          briefing.summary.criticalAlerts.push({
            airport: icao,
            type: 'weather',
            message: `Critical weather conditions at ${icao}: ${metar.severity.reasons.join(', ')}`
          });
        }

        // Add critical NOTAMs
        const criticalNotams = notams.filter(notam => notam.severity === 'critical');
        criticalNotams.forEach(notam => {
          briefing.summary.criticalAlerts.push({
            airport: icao,
            type: 'notam',
            message: notam.message
          });
        });
      });

      // Build enroute weather points when we have valid origin/destination coordinates
      try {
        const originAirport = briefing.airports[route.origin]?.airport;
        const destAirport = briefing.airports[route.destination]?.airport;
        if (originAirport?.lat != null && originAirport?.lon != null && destAirport?.lat != null && destAirport?.lon != null) {
          const samples = await this.getEnrouteWeatherPoints(
            { lat: Number(originAirport.lat), lon: Number(originAirport.lon) },
            { lat: Number(destAirport.lat), lon: Number(destAirport.lon) },
            8,
            route.flightLevel
          );
          briefing.routeWeather.points = samples;

          // Consider enroute severities in worstSeverity
          samples.forEach(pt => {
            if (pt.metar?.success && this.parser.compareSeverity(pt.metar.severity.level, briefing.summary.worstSeverity) > 0) {
              briefing.summary.worstSeverity = pt.metar.severity.level;
            }
          });
        }
      } catch (e) {
        console.warn('Enroute weather computation failed:', e.message);
      }

      // Generate recommendations
      briefing.summary.recommendations = this.generateRecommendations(briefing);

      return briefing;
    } catch (error) {
      throw new Error(`Failed to generate flight briefing: ${error.message}`);
    }
  }

  /**
   * Airport details lookup with AVWX primary, CheckWX fallback, AeroDataBox optional
   */
  async getAirportDetails(icao) {
    const cacheKey = `airport_${icao}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    let details = null;
    const upper = icao.toUpperCase();
    try {
      // AVWX Station endpoint
      if (this.avwxApiKey && !this.failedAPIs.has('avwx')) {
        details = await this.fetchAirportFromAVWX(upper);
      }
    } catch (e) {
      // continue to fallback
    }
    if (!details) {
      try {
        if (this.checkwxApiKey && !this.failedAPIs.has('checkwx')) {
          details = await this.fetchAirportFromCheckWX(upper);
        }
      } catch (e) {}
    }
    if (!details) {
      try {
        if (this.aeroDataBoxApiKey) {
          details = await this.fetchAirportFromAeroDataBox(upper);
        }
      } catch (e) {}
    }

    if (!details) {
      throw new Error(`Airport ${upper} not found`);
    }

    this.cache.set(cacheKey, { data: details, timestamp: Date.now() });
    return details;
  }

  /** Search airports for typeahead */
  async searchAirports(query) {
    const q = String(query).trim();
    if (!q) return [];
    // Try AeroDataBox search first (good coverage)
    try {
      if (this.aeroDataBoxApiKey) {
        return await this.searchAirportsAeroDataBox(q);
      }
    } catch (_) {}
    try {
      if (this.checkwxApiKey) {
        return await this.searchAirportsCheckWX(q);
      }
    } catch (_) {}
    // Minimal fallback: if looks like ICAO, just return that
    if (/^[A-Za-z]{4}$/.test(q)) {
      try {
        const a = await this.getAirportDetails(q.toUpperCase());
        return [a];
      } catch (_) {
        return [];
      }
    }
    return [];
  }

  /**
   * Compute enroute sample points and fetch nearest METAR for each
   */
  async getEnrouteWeatherPoints(start, end, numPoints = 8, flightLevel) {
    const points = this.sampleGreatCircle(start, end, numPoints);
    const results = [];
    for (const pt of points) {
      try {
        const nearest = await this.fetchNearestMetar(pt.lat, pt.lon);
        const raw = typeof nearest === 'string' ? nearest : nearest?.raw || nearest?.metar || nearest?.text;
        const metar = raw ? this.parser.parseMetar(raw) : null;
        results.push({
          lat: pt.lat,
          lon: pt.lon,
          altitudeFt: this.flightLevelToFeet(flightLevel),
          nearestStation: nearest?.station || (metar?.parsed?.station) || nearest?.icao || null,
          distanceNm: nearest?.distanceNm || nearest?.distance || null,
          metarSummary: metar?.decoded?.summary || null,
          metar
        });
      } catch (e) {
        results.push({ lat: pt.lat, lon: pt.lon, altitudeFt: this.flightLevelToFeet(flightLevel), metarSummary: null });
      }
    }
    return results;
  }

  flightLevelToFeet(fl) {
    if (!fl) return null;
    const m = String(fl).toUpperCase().match(/FL?(\d{2,3})/);
    if (m) return Number(m[1]) * 100;
    const n = Number(fl);
    return Number.isFinite(n) ? n : null;
  }

  sampleGreatCircle(start, end, numPoints) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const lat1 = toRad(start.lat);
    const lon1 = toRad(start.lon);
    const lat2 = toRad(end.lat);
    const lon2 = toRad(end.lon);
    const d = 2 * Math.asin(Math.sqrt(Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2));
    if (d === 0) return [start];
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const f = i / (numPoints + 1);
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      const lon = Math.atan2(y, x);
      points.push({ lat: toDeg(lat), lon: toDeg(lon) });
    }
    return points;
  }

  async fetchNearestMetar(lat, lon) {
    // Prefer AVWX nearby if available, otherwise CheckWX lat/lon
    if (this.avwxApiKey && !this.failedAPIs.has('avwx')) {
      try {
        const url = `${this.avwxBaseUrl}/metar/${lat},${lon}?n=1`;
        const resp = await axios.get(url, {
          headers: { 'Authorization': `BEARER ${this.avwxApiKey}`, 'User-Agent': 'PilotAssistant/1.0' },
          timeout: 10000
        });
        if (resp.data && resp.data.raw) {
          return { raw: resp.data.raw, station: resp.data.station };
        }
      } catch (e) {
        // continue to fallback
      }
    }
    if (this.checkwxApiKey && !this.failedAPIs.has('checkwx')) {
      const url = `${this.checkwxBaseUrl}/metar/lat/${lat}/lon/${lon}?limit=1`;
      const resp = await axios.get(url, { headers: { 'X-API-Key': this.checkwxApiKey, 'User-Agent': 'PilotAssistant/1.0' }, timeout: 10000 });
      if (resp.data?.data?.length) {
        const d = resp.data.data[0];
        return { raw: typeof d === 'string' ? d : d.raw_text || d, station: d.icao || d.station }; 
      }
    }
    // As a last resort, return null
    return null;
  }

  // -------- Airport provider helpers --------
  async fetchAirportFromAVWX(icao) {
    const url = `${this.avwxBaseUrl}/station/${icao}`;
    const resp = await axios.get(url, { headers: { 'Authorization': `BEARER ${this.avwxApiKey}`, 'User-Agent': 'PilotAssistant/1.0' }, timeout: 10000 });
    const d = resp.data || {};
    return {
      icao,
      name: d.name || d.city || null,
      country: d.country || d.country_code || null,
      lat: d.latitude || d.lat,
      lon: d.longitude || d.lon,
      elevationFt: d.elevation_ft || d.elevation || null,
      iata: d.iata || null
    };
  }

  async fetchAirportFromCheckWX(icao) {
    const url = `${this.checkwxBaseUrl}/airport/${icao}`;
    const resp = await axios.get(url, { headers: { 'X-API-Key': this.checkwxApiKey, 'User-Agent': 'PilotAssistant/1.0' }, timeout: 10000 });
    const d = resp.data?.data?.[0] || {};
    return {
      icao,
      name: d.name || null,
      country: d.country?.name || d.country || null,
      lat: d.latitude || d.position?.latitude,
      lon: d.longitude || d.position?.longitude,
      elevationFt: d.elevation?.feet || d.elevation_feet || null,
      iata: d.iata || null
    };
  }

  async fetchAirportFromAeroDataBox(icao) {
    const url = `${this.aeroDataBoxBaseUrl}/airports/icao/${icao}`;
    const resp = await axios.get(url, { headers: { 'X-RapidAPI-Key': this.aeroDataBoxApiKey }, timeout: 12000 });
    const d = resp.data || {};
    return {
      icao,
      name: d.name || null,
      country: d.country?.name || d.country || null,
      lat: d.location?.lat || d.latitude,
      lon: d.location?.lon || d.longitude,
      elevationFt: d.fieldElevation?.ft || d.elevationFt || null,
      iata: d.iata || d.iataCode || null
    };
  }

  async searchAirportsAeroDataBox(q) {
    const url = `${this.aeroDataBoxBaseUrl}/airports/search/term?q=${encodeURIComponent(q)}&limit=10`;
    const resp = await axios.get(url, { headers: { 'X-RapidAPI-Key': this.aeroDataBoxApiKey }, timeout: 12000 });
    return (resp.data?.items || []).map(it => ({
      icao: it.icao || it.icaoCode,
      name: it.name,
      country: it.country?.name || it.country,
      lat: it.location?.lat,
      lon: it.location?.lon,
      elevationFt: it.fieldElevation?.ft || null,
      iata: it.iata || it.iataCode
    })).filter(a => a.icao);
  }

  async searchAirportsCheckWX(q) {
    const url = `${this.checkwxBaseUrl}/search/airport/${encodeURIComponent(q)}`;
    const resp = await axios.get(url, { headers: { 'X-API-Key': this.checkwxApiKey, 'User-Agent': 'PilotAssistant/1.0' }, timeout: 10000 });
    return (resp.data?.data || []).slice(0, 10).map(d => ({
      icao: d.icao,
      name: d.name,
      country: d.country?.name || d.country,
      lat: d.position?.latitude,
      lon: d.position?.longitude,
      elevationFt: d.elevation?.feet || null,
      iata: d.iata
    })).filter(a => a.icao);
  }

  /**
   * Fetch METAR from real aviation API
   */
  async fetchMetarFromAPI(icaoCode) {
    try {
      // Try AVWX API first (free tier available)
      if (this.avwxApiKey && !this.failedAPIs.has('avwx')) {
        try {
          return await this.fetchFromAVWX(icaoCode, 'metar');
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`AVWX API key invalid or rate limited - disabling for this session`);
            this.failedAPIs.add('avwx');
          } else if (error.response?.status === 400) {
            console.log(`Invalid request to AVWX API for ${icaoCode}`);
          }
          throw error;
        }
      }
      
      // Fallback to CheckWX API
      if (this.checkwxApiKey && !this.failedAPIs.has('checkwx')) {
        try {
          return await this.fetchFromCheckWX(icaoCode, 'metar');
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`CheckWX API key invalid or rate limited - disabling for this session`);
            this.failedAPIs.add('checkwx');
          } else if (error.response?.status === 400) {
            console.log(`Invalid request to CheckWX API for ${icaoCode}`);
          }
          throw error;
        }
      }
      
      // If no API keys configured, use NOAA's free service
      return await this.fetchFromNOAA(icaoCode, 'metar');
      
    } catch (error) {
      console.error(`Failed to fetch METAR from real API for ${icaoCode}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch TAF from real aviation API
   */
  async fetchTafFromAPI(icaoCode) {
    try {
      // Try AVWX API first
      if (this.avwxApiKey) {
        return await this.fetchFromAVWX(icaoCode, 'taf');
      }
      
      // Fallback to CheckWX API
      if (this.checkwxApiKey) {
        return await this.fetchFromCheckWX(icaoCode, 'taf');
      }
      
      // If no API keys configured, use NOAA's free service
      return await this.fetchFromNOAA(icaoCode, 'taf');
      
    } catch (error) {
      console.error(`Failed to fetch TAF from real API for ${icaoCode}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch NOTAMs from real aviation API
   */
  async fetchNotamsFromAPI(icaoCode) {
    try {
      // Try CheckWX API for NOTAMs (has better NOTAM support)
      if (this.checkwxApiKey) {
        return await this.fetchNotamsFromCheckWX(icaoCode);
      }
      
      // Fallback to AVWX API
      if (this.avwxApiKey) {
        return await this.fetchNotamsFromAVWX(icaoCode);
      }
      
      // If no API keys, return empty array (NOTAMs are harder to get for free)
      console.log(`No API key configured for NOTAMs, returning empty array for ${icaoCode}`);
      return [];
      
    } catch (error) {
      console.error(`Failed to fetch NOTAMs from real API for ${icaoCode}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch data from AVWX API
   */
  async fetchFromAVWX(icaoCode, type) {
    const url = `${this.avwxBaseUrl}/${type}/${icaoCode}`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `BEARER ${this.avwxApiKey}`,
          'User-Agent': 'PilotAssistant/1.0'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.raw) {
        return response.data.raw;
      }
      
      throw new Error(`No ${type} data received from AVWX for ${icaoCode}`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.error(`❌ AVWX API 403: Invalid API key or rate limit exceeded`);
        console.error(`   Fix: Check your AVWX API key at https://avwx.rest/`);
        this.failedAPIs.add('avwx');
      } else if (error.response?.status === 404) {
        console.error(`❌ AVWX API 404: Airport ${icaoCode} not found in AVWX database`);
      } else if (error.response?.status === 429) {
        console.error(`❌ AVWX API 429: Rate limit exceeded - too many requests`);
      } else {
        console.error(`❌ AVWX API Error:`, error.response?.status, error.message);
      }
      throw error;
    }
  }

  /**
   * Fetch data from CheckWX API
   */
  async fetchFromCheckWX(icaoCode, type) {
    const url = `${this.checkwxBaseUrl}/${type}/${icaoCode}`;
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': this.checkwxApiKey,
        'User-Agent': 'PilotAssistant/1.0'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    throw new Error(`No ${type} data received from CheckWX for ${icaoCode}`);
  }

  /**
   * Fetch data from NOAA (free, no API key required)
   */
  async fetchFromNOAA(icaoCode, type) {
    const baseUrl = 'https://aviationweather.gov/api/data';
    const url = `${baseUrl}/${type}/${icaoCode}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'PilotAssistant/1.0'
      },
      timeout: 15000
    });
    
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    throw new Error(`No ${type} data received from NOAA for ${icaoCode}`);
  }

  /**
   * Fetch NOTAMs from CheckWX API
   */
  async fetchNotamsFromCheckWX(icaoCode) {
    const url = `${this.checkwxBaseUrl}/notam/${icaoCode}`;
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': this.checkwxApiKey,
        'User-Agent': 'PilotAssistant/1.0'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(notam => ({
        id: notam.id || `NOTAM-${Date.now()}`,
        type: notam.type || 'general',
        severity: this.mapNotamSeverity(notam.severity),
        message: notam.message || notam.text,
        startTime: notam.startTime || new Date().toISOString(),
        endTime: notam.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: icaoCode
      }));
    }
    
    return [];
  }

  /**
   * Fetch NOTAMs from AVWX API
   */
  async fetchNotamsFromAVWX(icaoCode) {
    const url = `${this.avwxBaseUrl}/notam/${icaoCode}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `BEARER ${this.avwxApiKey}`,
        'User-Agent': 'PilotAssistant/1.0'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.notams) {
      return response.data.notams.map(notam => ({
        id: notam.id || `NOTAM-${Date.now()}`,
        type: notam.type || 'general',
        severity: this.mapNotamSeverity(notam.severity),
        message: notam.message || notam.text,
        startTime: notam.startTime || new Date().toISOString(),
        endTime: notam.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: icaoCode
      }));
    }
    
    return [];
  }

  /**
   * Map NOTAM severity from API to our internal format
   */
  mapNotamSeverity(apiSeverity) {
    const severityMap = {
      'CRITICAL': 'critical',
      'HIGH': 'critical',
      'MEDIUM': 'caution',
      'LOW': 'normal',
      'INFO': 'normal'
    };
    
    return severityMap[apiSeverity?.toUpperCase()] || 'normal';
  }

  /**
   * Log API configuration status on startup
   */
  logApiStatus() {
    console.log('\n🌤️  Weather API Configuration:');
    console.log('================================');
    
    if (this.avwxApiKey) {
      if (this.failedAPIs.has('avwx')) {
        console.log('❌ AVWX API: Configured but failed (disabled)');
      } else {
        console.log('✅ AVWX API: Configured');
      }
    } else {
      console.log('❌ AVWX API: Not configured');
    }
    
    if (this.checkwxApiKey) {
      if (this.failedAPIs.has('checkwx')) {
        console.log('❌ CheckWX API: Configured but failed (disabled)');
      } else {
        console.log('✅ CheckWX API: Configured');
      }
    } else {
      console.log('❌ CheckWX API: Not configured');
    }
    
    console.log('✅ NOAA API: Available (free)');
    console.log('✅ Mock Data: Available (fallback)');
    
    if (!this.avwxApiKey && !this.checkwxApiKey) {
      console.log('\n⚠️  No API keys configured!');
      console.log('   The system will use NOAA free service and mock data.');
      console.log('   For full features, run: node setup-api.js');
      console.log('   Or get free API keys from:');
      console.log('   - AVWX: https://avwx.rest/');
      console.log('   - CheckWX: https://www.checkwx.com/');
    } else if (this.failedAPIs.size > 0) {
      console.log('\n⚠️  Some APIs failed and are disabled for this session.');
      console.log('   The system will use available APIs and mock data.');
      console.log('   Restart the server to retry failed APIs.');
    } else {
      console.log('\n🎉 API keys configured! Real weather data will be used.');
    }
    
    console.log('================================\n');
  }

  /**
   * Get mock METAR data
   */
  getMockMetar(icaoCode) {
    const mock = this.mockData[icaoCode];
    if (mock) {
      return mock.metar;
    }
    
    // Generate realistic mock METAR for unknown airports
    const windDir = Math.floor(Math.random() * 360);
    const windSpeed = 8 + Math.floor(Math.random() * 15);
    const visibility = 5 + Math.floor(Math.random() * 6);
    const temp = 15 + Math.floor(Math.random() * 15);
    const dewpoint = temp - Math.floor(Math.random() * 8);
    const pressure = 2990 + Math.floor(Math.random() * 30);
    
    return `METAR ${icaoCode} 121251Z ${windDir.toString().padStart(3, '0')}${windSpeed}KT ${visibility}SM FEW035 SCT100 ${temp}/${dewpoint} A${pressure} RMK AO2 SLP201=`;
  }

  /**
   * Get mock TAF data
   */
  getMockTaf(icaoCode) {
    const mock = this.mockData[icaoCode];
    if (mock) {
      return mock.taf;
    }
    
    // Generate realistic mock TAF for unknown airports
    const windDir = Math.floor(Math.random() * 360);
    const windSpeed = 10 + Math.floor(Math.random() * 10);
    const visibility = 6 + Math.floor(Math.random() * 4);
    
    return `TAF ${icaoCode} 121120Z 1212/1318 ${windDir.toString().padStart(3, '0')}${windSpeed}KT P${visibility}SM SCT035 BKN100=`;
  }

  /**
   * Get mock NOTAM data
   */
  getMockNotams(icaoCode) {
    return this.mockNotams[icaoCode] || [];
  }

  /**
   * Determine airport role in flight route
   */
  getAirportRole(icao, route) {
    if (icao === route.origin) return 'origin';
    if (icao === route.destination) return 'destination';
    if (route.alternates && route.alternates.includes(icao)) return 'alternate';
    return 'unknown';
  }

  /**
   * Generate flight recommendations based on weather briefing
   */
  generateRecommendations(briefing) {
    const recommendations = [];
    
    if (briefing.summary.worstSeverity === 'critical') {
      recommendations.push('Consider delaying departure due to critical weather conditions');
      recommendations.push('Review alternate airports and ensure adequate fuel reserves');
    } else if (briefing.summary.worstSeverity === 'caution') {
      recommendations.push('Monitor weather conditions closely during flight');
      recommendations.push('Consider filing for a higher altitude if icing is a concern');
    }

    if (briefing.summary.criticalAlerts.length > 0) {
      recommendations.push('Review all critical alerts before departure');
    }

    if (recommendations.length === 0) {
      recommendations.push('Weather conditions are favorable for flight');
    }

    return recommendations;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Check API health and configuration
   */
  async checkApiHealth() {
    const health = {
      avwx: { configured: !!this.avwxApiKey, status: 'unknown' },
      checkwx: { configured: !!this.checkwxApiKey, status: 'unknown' },
      noaa: { configured: true, status: 'unknown' },
      fallback: 'mock'
    };

    // Test AVWX API if configured
    if (this.avwxApiKey) {
      try {
        await this.fetchFromAVWX('KJFK', 'metar');
        health.avwx.status = 'working';
      } catch (error) {
        health.avwx.status = 'error';
        health.avwx.error = error.message;
      }
    }

    // Test CheckWX API if configured
    if (this.checkwxApiKey) {
      try {
        await this.fetchFromCheckWX('KJFK', 'metar');
        health.checkwx.status = 'working';
      } catch (error) {
        health.checkwx.status = 'error';
        health.checkwx.error = error.message;
      }
    }

    // Test NOAA API (always available)
    try {
      await this.fetchFromNOAA('KJFK', 'metar');
      health.noaa.status = 'working';
    } catch (error) {
      health.noaa.status = 'error';
      health.noaa.error = error.message;
    }

    // Determine primary API
    if (health.avwx.status === 'working') {
      health.primary = 'avwx';
    } else if (health.checkwx.status === 'working') {
      health.primary = 'checkwx';
    } else if (health.noaa.status === 'working') {
      health.primary = 'noaa';
    } else {
      health.primary = 'mock';
    }

    return health;
  }
}

module.exports = WeatherService;