const express = require('express');
const AirportLookupService = require('../services/airportLookup');

const router = express.Router();
const airportLookup = new AirportLookupService();

/**
 * GET /api/airport-lookup/search
 * Search for airports by name, city, ICAO, or IATA code
 */
router.get('/search', (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Query must be at least 2 characters long'
      });
    }

    const results = airportLookup.searchAirports(query.trim(), parseInt(limit));
    
    res.json({
      success: true,
      query: query.trim(),
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport lookup error:', error);
    res.status(500).json({
      error: 'Failed to search airports',
      message: error.message
    });
  }
});

/**
 * GET /api/airport-lookup/icao/:icao
 * Get airport details by ICAO code
 */
router.get('/icao/:icao', (req, res) => {
  try {
    const { icao } = req.params;
    
    if (!airportLookup.isValidIcao(icao)) {
      return res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 4 uppercase letters'
      });
    }

    const airport = airportLookup.getAirportByIcao(icao);
    
    if (!airport) {
      return res.status(404).json({
        error: 'Airport not found',
        message: `No airport found with ICAO code: ${icao}`
      });
    }

    res.json({
      success: true,
      airport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport lookup error:', error);
    res.status(500).json({
      error: 'Failed to get airport',
      message: error.message
    });
  }
});

/**
 * GET /api/airport-lookup/iata/:iata
 * Get airport details by IATA code
 */
router.get('/iata/:iata', (req, res) => {
  try {
    const { iata } = req.params;
    
    if (!airportLookup.isValidIata(iata)) {
      return res.status(400).json({
        error: 'Invalid IATA code',
        message: 'IATA code must be 3 uppercase letters'
      });
    }

    const airport = airportLookup.getAirportByIata(iata);
    
    if (!airport) {
      return res.status(404).json({
        error: 'Airport not found',
        message: `No airport found with IATA code: ${iata}`
      });
    }

    res.json({
      success: true,
      airport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport lookup error:', error);
    res.status(500).json({
      error: 'Failed to get airport',
      message: error.message
    });
  }
});

/**
 * GET /api/airport-lookup/country/:country
 * Get all airports in a country
 */
router.get('/country/:country', (req, res) => {
  try {
    const { country } = req.params;
    
    if (!country || country.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid country',
        message: 'Country name must be at least 2 characters long'
      });
    }

    const airports = airportLookup.getAirportsByCountry(country.trim());
    
    res.json({
      success: true,
      country: country.trim(),
      airports,
      count: airports.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport lookup error:', error);
    res.status(500).json({
      error: 'Failed to get airports by country',
      message: error.message
    });
  }
});

/**
 * GET /api/airport-lookup/stats
 * Get airport database statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = airportLookup.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport lookup error:', error);
    res.status(500).json({
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

/**
 * POST /api/airport-lookup/validate
 * Validate and resolve airport codes/names
 */
router.post('/validate', (req, res) => {
  try {
    const { airports } = req.body;
    
    if (!airports || !Array.isArray(airports)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'airports must be an array'
      });
    }

    const results = airports.map(input => {
      const normalizedInput = input.trim().toUpperCase();
      
      // Try ICAO first
      if (airportLookup.isValidIcao(normalizedInput)) {
        const airport = airportLookup.getAirportByIcao(normalizedInput);
        return {
          input,
          icao: airport ? airport.icao : null,
          iata: airport ? airport.iata : null,
          name: airport ? airport.name : null,
          city: airport ? airport.city : null,
          country: airport ? airport.country : null,
          valid: !!airport,
          type: 'icao'
        };
      }
      
      // Try IATA
      if (airportLookup.isValidIata(normalizedInput)) {
        const airport = airportLookup.getAirportByIata(normalizedInput);
        return {
          input,
          icao: airport ? airport.icao : null,
          iata: airport ? airport.iata : null,
          name: airport ? airport.name : null,
          city: airport ? airport.city : null,
          country: airport ? airport.country : null,
          valid: !!airport,
          type: 'iata'
        };
      }
      
      // Try search
      const searchResults = airportLookup.searchAirports(input, 1);
      if (searchResults.length > 0) {
        const airport = searchResults[0];
        return {
          input,
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          valid: true,
          type: 'search',
          matchType: airport.matchType,
          score: airport.score
        };
      }
      
      return {
        input,
        icao: null,
        iata: null,
        name: null,
        city: null,
        country: null,
        valid: false,
        type: 'unknown'
      };
    });

    res.json({
      success: true,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Airport validation error:', error);
    res.status(500).json({
      error: 'Failed to validate airports',
      message: error.message
    });
  }
});

module.exports = router;
