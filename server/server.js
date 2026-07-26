/**
 * server.js — Entry Point for Mishkwat Backend
 * 
 * This file does 3 things:
 * 1. Loads environment variables from the .env file
 * 2. Connects to the MongoDB database
 * 3. Starts the Express HTTP server on the configured port
 * 
 * For production deployment, use PM2:
 *   pm2 start ecosystem.config.cjs --env production
 * This will automatically run the server across all CPU cores.
 * Reloaded: 1
 */


import dotenv from 'dotenv';
dotenv.config(); // Load all variables from .env into process.env

import app from './src/app.js';
import connectToDatabase from './src/config/db.js';

import { loginShiprocket } from './src/services/shiprocket.js';
import { startTrackingSyncCron } from './src/cron/trackingSync.js';

// Try to login to Shiprocket if credentials are provided
if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
  loginShiprocket().catch((err) => {
    console.warn("⚠️ Shiprocket initial login failed. Will retry on demand:", err.message);
  });
} else {
  console.warn("⚠️ Shiprocket credentials not set. Shipping features will be unavailable until credentials are added to .env");
}

// The port the server will listen on. Defaults to 5000 if not set in .env
const PORT = process.env.PORT || 5000;

// Step 1: Connect to the database, then start the server
connectToDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Mishkwat API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    // Start Shiprocket tracking sync scheduler (runs every 30 minutes)
    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      startTrackingSyncCron();
    }
  });

  // ---- Error Safety Nets ----
  // These handlers catch fatal errors that would otherwise crash the server silently.

  // If a Promise is rejected but nobody catches it, log it and shut down gracefully
  process.on('unhandledRejection', (error) => {
    console.error(`❌ Unhandled Promise Rejection: ${error.message}`);
    server.close(() => process.exit(1));
  });

  // If a coding error throws an exception outside of a try/catch, log it and exit
  process.on('uncaughtException', (error) => {
    console.error(`❌ Uncaught Exception: ${error.message}`);
    process.exit(1);
  });

  // Graceful shutdown: when the hosting platform (Render, Heroku, PM2) sends a
  // SIGTERM signal to stop the app, finish serving all current requests before exiting.
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed. Process terminated.');
      process.exit(0);
    });
  });
});
