const express = require('express');
const {
  getCurrentFlight,
  getRecentFlights,
  updateFromBriefing,
  updateFromSimpleBriefing,
  getRecentSearches,
} = require('../services/flightStore');

const router = express.Router();

// GET current flight
router.get('/current', (req, res) => {
  try {
    const data = getCurrentFlight();
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET recent flights
router.get('/recent', (req, res) => {
  try {
    const list = getRecentFlights();
    res.json({ success: true, flights: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST briefing: simple payload to set current flight directly
router.post('/briefing', (req, res) => {
  try {
    const { departure, destination } = req.body || {};
    if (!departure || !destination) {
      return res.status(400).json({ success: false, message: 'departure and destination are required' });
    }
    updateFromSimpleBriefing(req.body);
    const data = getCurrentFlight();
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

// Additional routes for searches
router.get('/searches/recent', (req, res) => {
  try {
    const searches = getRecentSearches();
    res.json({ success: true, searches });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


