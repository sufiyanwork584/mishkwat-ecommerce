import mongoose from 'mongoose';

/**
 * connectToDatabase()
 * 
 * Connects the application to the MongoDB Atlas database.
 * The connection string (MONGO_URI) is stored in the .env file.
 * 
 * Connection Pool Settings:
 * - maxPoolSize: Maximum number of simultaneous database connections.
 *   Set to 50 to handle thousands of concurrent users without running
 *   out of connections. (Default is only 5, which is too low for production.)
 * - minPoolSize: Keep at least 5 connections alive at all times so
 *   responses are instant even when traffic is low.
 * - socketTimeoutMS: If a database query takes longer than 45 seconds,
 *   kill it. This prevents one slow query from freezing the entire server.
 * - serverSelectionTimeoutMS: If MongoDB Atlas is unreachable, fail fast
 *   after 5 seconds instead of hanging indefinitely.
 */
const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,          // Handle up to 50 simultaneous DB operations
      minPoolSize: 5,           // Keep 5 connections warm at all times
      socketTimeoutMS: 45000,   // Kill queries that take longer than 45 seconds
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unreachable
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure code. PM2 will automatically restart it.
    process.exit(1);
  }
};

export default connectToDatabase;
