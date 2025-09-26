const express = require('express');
const WeatherService = require('../services/weatherService');

const router = express.Router();
const weatherService = new WeatherService();

/**
 * POST /api/weather/decode
 * Decode raw METAR or TAF text to plain English
 */
router.post('/decode', async (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text) {
      return res.status(400).json({
        error: 'Missing required field: text',
        message: 'Please provide METAR or TAF text to decode'
      });
    }

    if (!type || !['metar', 'taf'].includes(type.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid type',
        message: 'Type must be either "metar" or "taf"'
      });
    }

    let result;
    if (type.toLowerCase() === 'metar') {
      result = weatherService.parser.parseMetar(text);
    } else {
      result = weatherService.parser.parseTaf(text);
    }

    res.json({
      success: true,
      type: type.toLowerCase(),
      ...result
    });

  } catch (error) {
    console.error('Weather decode error:', error);
    res.status(500).json({
      error: 'Failed to decode weather data',
      message: error.message
    });
  }
});

/**
 * POST /api/weather/winds
 * Get winds aloft along a route
 * Body: { origin, destination, flightLevel, numPoints? }
 */
router.post('/winds', async (req, res) => {
  try {
    const { origin, destination, flightLevel, numPoints = 8 } = req.body || {};

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Missing origin/destination', message: 'Provide origin and destination ICAO codes' });
    }

    // Resolve airport coordinates
    const [orig, dest] = await Promise.all([
      weatherService.getAirportDetails(String(origin).toUpperCase()),
      weatherService.getAirportDetails(String(destination).toUpperCase())
    ]);

    if (orig?.lat == null || orig?.lon == null || dest?.lat == null || dest?.lon == null) {
      return res.status(400).json({ error: 'Missing coordinates', message: 'Could not resolve airport coordinates' });
    }

    const winds = await weatherService.getWindsAlongRoute(
      { lat: Number(orig.lat), lon: Number(orig.lon) },
      { lat: Number(dest.lat), lon: Number(dest.lon) },
      Math.max(2, Math.min(50, Number(numPoints) || 8)),
      flightLevel
    );

    res.json({ success: true, origin: String(origin).toUpperCase(), destination: String(destination).toUpperCase(), flightLevel, points: winds, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Winds aloft fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch winds aloft', message: error.message });
  }
});

/**
 * GET /api/weather/metar/:icao
 * Get current METAR for specific airport
 */
router.get('/metar/:icao', async (req, res) => {
  try {
    const { icao } = req.params;
    
    if (!icao || icao.length !== 4) {
      return res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 4 characters long'
      });
    }

    const result = await weatherService.getMetar(icao.toUpperCase());
    res.json(result);

  } catch (error) {
    console.error('METAR fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch METAR',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/taf/:icao
 * Get current TAF for specific airport
 */
router.get('/taf/:icao', async (req, res) => {
  try {
    const { icao } = req.params;
    
    if (!icao || icao.length !== 4) {
      return res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 4 characters long'
      });
    }

    const result = await weatherService.getTaf(icao.toUpperCase());
    res.json(result);

  } catch (error) {
    console.error('TAF fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch TAF',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/notams/:icao
 * Get current NOTAMs for specific airport
 */
router.get('/notams/:icao', async (req, res) => {
  try {
    const { icao } = req.params;
    
    if (!icao || icao.length !== 4) {
      return res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 4 characters long'
      });
    }

    const notams = await weatherService.getNotams(icao.toUpperCase());
    res.json({
      success: true,
      icao: icao.toUpperCase(),
      notams,
      count: notams.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NOTAMs fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch NOTAMs',
      message: error.message
    });
  }
});

/**
 * POST /api/weather/multiple
 * Get weather data for multiple airports
 */
router.post('/multiple', async (req, res) => {
  try {
    const { airports, types = ['metar', 'taf', 'notams'] } = req.body;
    
    if (!airports || !Array.isArray(airports)) {
      return res.status(400).json({
        error: 'Invalid airports',
        message: 'Airports must be an array of ICAO codes'
      });
    }

    if (airports.length > 10) {
      return res.status(400).json({
        error: 'Too many airports',
        message: 'Maximum 10 airports allowed per request'
      });
    }

    const results = {};
    
    // Process each airport
    for (const icao of airports) {
      if (!icao || icao.length !== 4) {
        results[icao] = {
          error: 'Invalid ICAO code'
        };
        continue;
      }

      const upperIcao = icao.toUpperCase();
      results[upperIcao] = {};

      try {
        // Fetch requested data types in parallel
        const promises = [];
        
        if (types.includes('metar')) {
          promises.push(weatherService.getMetar(upperIcao).then(data => ({ type: 'metar', data })));
        }
        if (types.includes('taf')) {
          promises.push(weatherService.getTaf(upperIcao).then(data => ({ type: 'taf', data })));
        }
        if (types.includes('notams')) {
          promises.push(weatherService.getNotams(upperIcao).then(data => ({ type: 'notams', data })));
        }

        const responses = await Promise.all(promises);
        
        responses.forEach(({ type, data }) => {
          results[upperIcao][type] = data;
        });

      } catch (error) {
        results[upperIcao].error = error.message;
      }
    }

    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Multiple weather fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/cache/stats
 * Get cache statistics (for debugging)
 */
router.get('/cache/stats', (req, res) => {
  try {
    const stats = weatherService.getCacheStats();
    res.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error.message
    });
  }
});

/**
 * DELETE /api/weather/cache
 * Clear weather data cache
 */
router.delete('/cache', (req, res) => {
  try {
    weatherService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/airports/search?q=...
 * Search airports by name/ICAO/IATA for typeahead
 */
router.get('/airports/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.status(400).json({ error: 'Invalid query', message: 'Provide at least 2 characters' });
    }
    const results = await weatherService.searchAirports(q);
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search airports', message: error.message });
  }
});

/**
 * GET /api/weather/airports/:icao
 * Get single airport details
 */
router.get('/airports/:icao', async (req, res) => {
  try {
    const { icao } = req.params;
    if (!icao || icao.length !== 4) {
      return res.status(400).json({ error: 'Invalid ICAO code', message: 'ICAO must be 4 letters' });
    }
    const airport = await weatherService.getAirportDetails(icao.toUpperCase());
    res.json({ success: true, airport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch airport', message: error.message });
  }
});

module.exports = router;