// server/config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://bansi-clothing-shop:bansi1234@bansi.diqk8.mongodb.net/?retryWrites=true&w=majority&appName=bansi",
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "0495d546913bad83a01d0405d6ca4f191990050607caabc068e2846a3f35d8f1",
  NODE_ENV: process.env.NODE_ENV || "development"
};