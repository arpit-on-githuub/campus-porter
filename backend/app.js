const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const requestRoutes = require('./src/routes/requests');
const paymentRoutes = require('./src/routes/payments');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Campus Porter API is running' });
});

module.exports = app;