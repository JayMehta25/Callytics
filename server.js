const express = require('express');
const cors = require('cors');
const managerRoutes = require('./routes/manager');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: err.message 
  });
});

// Routes
app.use('/api/managers', managerRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded:', {
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
  });
}); 