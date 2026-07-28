import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import shipmentRoutes from "./routes/shipmentRoutes.js";
import pincodeRoutes from './routes/pincodeRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

import { validateEnv } from './utils/envValidator.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Validate required environment variables on startup
validateEnv();

const app = express();

// --------------- SECURITY MIDDLEWARE ---------------
// Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet());

// Sanitize user-supplied data to prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

// --------------- CORS CONFIGURATION ---------------
// Cross-Origin Resource Sharing (CORS) controls which domains can access this API.
// process.env.CLIENT_URL should be set in production (e.g. https://mishkwat.vercel.app)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files from the 'public/uploads' directory directly to the web
app.use('/uploads', express.static('public/uploads'));

// --------------- GENERAL MIDDLEWARE ---------------
// Parse incoming JSON payloads (req.body) up to 10mb in size, capturing rawBody for webhook validation
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Parse URL-encoded payloads (like form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Compress response bodies for all request that traverse through the middleware (GZIP caching for high load)
app.use(compression());

// Log HTTP requests during development for easier debugging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --------------- RATE LIMITING ---------------
// Global API rate limiter to prevent basic DDoS attacks. 
// Allows 1000 requests per 15 minutes per IP address. Excludes webhook endpoints.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl.startsWith('/api/v1/webhooks'),
});

// Strict rate limiter for sensitive endpoints (like login/signup)
// Allows 10 requests per 15 minutes per IP address to prevent brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/', generalLimiter);

// --------------- HEALTH CHECK ---------------
// A simple endpoint to check if the server is alive. Useful for monitoring tools.
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Mishkwat API is running', timestamp: new Date().toISOString() });
});

// --------------- API ROUTES ---------------
// Each line below connects a URL path to a specific router file.
// Example: any request to /api/v1/products will be handled by productRoutes.js

app.use('/api/v1/auth', authRoutes);             // Login, Register, Forgot Password
app.use('/api/v1/products', productRoutes);       // Browse, Search, CRUD Products
app.use('/api/v1/categories', categoryRoutes);    // Product Categories
app.use('/api/v1/cart', cartRoutes);              // Shopping Cart
app.use('/api/v1/wishlist', wishlistRoutes);      // User Wishlist
app.use('/api/v1/orders', orderRoutes);           // Place & Track Orders
app.use('/api/v1/payments', paymentRoutes);       // Razorpay Payment Processing
app.use('/api/v1/coupons', couponRoutes);         // Discount Coupons
app.use('/api/v1/reviews', reviewRoutes);         // Product Reviews & Ratings
app.use('/api/v1/banners', bannerRoutes);         // Homepage Banners (Admin)
app.use('/api/v1/deals', dealRoutes);             // Promotional Deals
app.use('/api/v1/users', userRoutes);             // User Management (Admin)
app.use('/api/v1/analytics', analyticsRoutes);    // Sales Analytics (Admin)
app.use('/api/v1/newsletter', newsletterRoutes);  // Email Newsletter Subscriptions
app.use('/api/v1/upload', uploadRoutes);          // Image Upload (Cloudinary)
app.use('/api/v1/blogs', blogRoutes);             // Blog Posts
app.use('/api/v1/returns', returnRoutes);         // Return Requests
app.use('/api/v1/refunds', refundRoutes);         // Refund Processing
app.use('/api/v1/pincode', pincodeRoutes);         // Pincode Lookup (India Post proxy)
app.use('/api/v1/shipment', shipmentRoutes);       // Shiprocket Shipment Management
app.use('/api/v1/webhooks', webhookRoutes);       // Razorpay & Shiprocket Webhooks

// --------------- ERROR HANDLING ---------------
// If no route above matches the request, send a 404 "Not Found" response
app.use(notFound);

// If any route throws an error, catch it and send a clean JSON error response
app.use(errorHandler);

export default app;
