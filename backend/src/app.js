const express = require('express');
const cors = require('cors');

const parkingRoutes = require('./routes/parkingRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/parking', parkingRoutes);
app.use('/api/cards', cardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
