const express = require('express');
const cors = require('cors');

const parkingRoutes = require('./routes/parkingRoutes');
const cardRoutes = require('./routes/cardRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const { authenticate, allowRoles } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/parking', authenticate, parkingRoutes);
app.use('/api/cards', authenticate, allowRoles('admin', 'manager'), cardRoutes);
app.use('/api/users', authenticate, allowRoles('admin'), userRoutes);
app.use('/api/reports', authenticate, allowRoles('admin', 'manager'), reportRoutes);
app.use('/api/auth', authenticate, authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
