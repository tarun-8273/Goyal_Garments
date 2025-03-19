const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Add this import
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const billRoutes = require('./routes/billRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables first
dotenv.config();

// Log environment details for debugging
console.log('MongoDB URI exists:', !!process.env.MONGO_URI);
console.log('Environment:', process.env.NODE_ENV);

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/auth', authRoutes);

// Serve static assets in production - ADD THIS SECTION
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route that doesn't match the above should be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});