// server.js - Run this on your local machine with Node.js
require('dotenv').config();
const express = require('express');
const postgres = require('postgres');
const cors = require('cors');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Enable CORS for React Native
app.use(cors());
app.use(express.json());

// PostgreSQL connection using environment variables
const sql = postgres({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ success: true, time: result[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await sql`
      SELECT * FROM routes
      ORDER BY route_short_name
    `;
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trips by route
app.get('/api/routes/:routeId/trips', async (req, res) => {
  try {
    const { routeId } = req.params;
    const trips = await sql`
      SELECT * FROM trips
      WHERE route_id = ${routeId}
      ORDER BY trip_id
    `;
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stops by location
app.get('/api/stops/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 0.01 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const rad = parseFloat(radius);

    const stops = await sql`
      SELECT * FROM stops
      WHERE stop_lat BETWEEN ${latitude - rad} AND ${latitude + rad}
        AND stop_lon BETWEEN ${longitude - rad} AND ${longitude + rad}
      ORDER BY stop_name
    `;
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search stops by name
app.get('/api/stops/search', async (req, res) => {
  try {
    const { q } = req.query;
    const stops = await sql`
      SELECT * FROM stops
      WHERE stop_name ILIKE ${'%' + q + '%'}
      ORDER BY stop_name
      LIMIT 50
    `;
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get routes with trip counts
app.get('/api/routes/stats', async (req, res) => {
  try {
    const routes = await sql`
      SELECT 
        r.*,
        COUNT(t.trip_id) as trip_count
      FROM routes r
      LEFT JOIN trips t ON r.route_id = t.route_id
      GROUP BY r.route_id
      ORDER BY r.route_short_name
    `;
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get route_short_name from routes given stop_code from stops
app.get('/api/stops/:stopCode/routes', async (req, res) => {
  try {
    const { stopCode } = req.params;
    
    // This assumes you have a stop_times table that links stops to trips
    // If you don't have stop_times, you'll need to adjust this query
    const routes = await sql`
      SELECT DISTINCT r.route_short_name, r.route_long_name, r.route_id
      FROM routes r
      JOIN trips t ON r.route_id = t.route_id
      JOIN stop_times st ON t.trip_id = st.trip_id
      JOIN stops s ON st.stop_id = s.stop_id
      WHERE s.stop_code = ${stopCode}
      ORDER BY r.route_short_name
    `;
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trip_id from trips given route_short_name from routes
app.get('/api/routes/name/:routeShortName/trips', async (req, res) => {
  try {
    const { routeShortName } = req.params;
    const trips = await sql`
      SELECT t.trip_id, t.trip_headsign, t.direction_id, t.service_id
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      WHERE r.route_short_name = ${routeShortName}
      ORDER BY t.trip_id
    `;
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Android emulator can access at http://10.0.2.2:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await sql.end();
  process.exit();
});