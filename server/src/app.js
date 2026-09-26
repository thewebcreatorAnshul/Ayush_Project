const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sanitizeNoSql = require('./middleware/sanitize');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { getCategories } = require('./controllers/foodController');

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Response compression
app.use(compression());

// Cross-origin resource sharing
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize data against NoSQL query injection
app.use(sanitizeNoSql);

// Rate limiter for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: ['Rate limit exceeded']
  }
});
app.use('/api/auth', authLimiter);
app.use('/api/admin/auth', authLimiter);

// Root health & status endpoints
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Ordering & Admin API Gateway is running'
  });
});

// Direct Categories alias endpoint
app.get('/api/categories', getCategories);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
