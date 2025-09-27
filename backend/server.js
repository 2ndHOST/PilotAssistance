const express = require('express');
const cors = require('cors');
require('dotenv').config();

const weatherRoutes = require('./src/routes/weather');
const briefingRoutes = require('./src/routes/briefing');
const WeatherService = require('./src/services/weatherService');
const flightRoutes = require('./src/routes/flight');
const airportLookupRoutes = require('./src/routes/airportLookup');

// Initialize weather service
const weatherService = new WeatherService();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/briefing', briefingRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/airport-lookup', airportLookupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Weather Assistant API is running',
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get('/api/health', async (req, res) => {
  try {
    const apiHealth = await weatherService.checkApiHealth();
    res.json({
      status: 'OK',
      message: 'Weather API health check completed',
      timestamp: new Date().toISOString(),
      apis: apiHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to check API health',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Assistant API running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;