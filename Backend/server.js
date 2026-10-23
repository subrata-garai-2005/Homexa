import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../Frontend/dist');

import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import propertyRoutes from './src/routes/propertyRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import Property from './src/models/Property.js';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (EC2, Nginx, Load Balancers) to read client IP accurately
app.set('trust proxy', 1);

// Connect DB
connectDB();

// Middleware - Allow dynamic origin for seamless fullstack deployment on any domain/IP
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🏡 Homexa API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      bookings: '/api/bookings',
      payments: '/api/payments',
      ai: '/api/ai'
    },
    docs: 'See README for API documentation'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Rate Limiting Configuration
// 1. General API Rate Limiter (200 requests per 15 mins per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// 2. Auth Rate Limiter (20 attempts per 15 mins to protect against brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts. Please try again after 15 minutes'
  }
});

// Apply rate limiting to APIs (Static files, Google verification, robots.txt are exempt)
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);

// Google Search Console verification route
app.get('/google7777e5ba595168f6.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send('google-site-verification: google7777e5ba595168f6.html');
});

// Reject any non-existent google verification requests with 404 (required by Google Search Console security check)
app.get('/google*.html', (req, res) => {
  res.status(404).send('Not Found');
});


// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  res.type('text/plain').send(
`# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /properties
Allow: /map

# Disallow private and authenticated pages
Disallow: /bookings
Disallow: /bookings/*
Disallow: /profile
Disallow: /wishlist
Disallow: /host
Disallow: /host/*
Disallow: /login
Disallow: /register
Disallow: /api/

# Sitemap location
Sitemap: ${protocol}://${host}/sitemap.xml
`
  );
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let properties = [];
    try {
      properties = await Property.find({ isActive: { $ne: false } }, '_id updatedAt').lean();
    } catch (err) {
      console.warn('Could not query properties for sitemap:', err.message);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/properties</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/map</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    properties.forEach(p => {
      const pMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : today;
      xml += `
  <url>
    <loc>${baseUrl}/properties/${p._id}</loc>
    <lastmod>${pMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Serve frontend build if dist folder exists (Single-port fullstack deployment)
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '🏡 Homexa API is running! (Frontend build not found. Please run "npm run build" in Frontend folder)',
    });
  });
}

// 404 for remaining unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  
  let message = err.message || 'Internal Server Error';
  let statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  if (err.message && err.message.includes('Only image files')) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🏡 Homexa Backend Started!
🚀 Server: http://localhost:${PORT}
📡 API: http://localhost:${PORT}/api
🌍 Env: ${process.env.NODE_ENV || 'development'}
💾 DB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
  `);
});
