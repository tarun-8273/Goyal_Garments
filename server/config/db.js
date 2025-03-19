const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI defined:', process.env.MONGO_URI ? 'Yes' : 'No');
    
    // Make sure we have a URI before attempting to connect
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined. Check your environment variables.');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Print more details about the error for debugging
    if (error.name === 'MongoParseError') {
      console.error('This appears to be an issue with the MongoDB connection string format.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('This appears to be a network connectivity issue.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;