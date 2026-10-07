import mongoose from 'mongoose';
import dns from "dns";
dns.setServers(['1.1.1.1', '8.8.8.8']);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    // Don't exit in dev if no DB - allow server to run for frontend dev
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Running without DB - set MONGO_URI in .env');
    }
  }
};

export default connectDB;
