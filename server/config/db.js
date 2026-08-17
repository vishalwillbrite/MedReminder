const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medreminder');
    console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Failure]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
