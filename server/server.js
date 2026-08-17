const dotenv = require('dotenv');
// Load environment variables immediately before loading any application modules
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const initCronJobs = require('./services/cronService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect Database
connectDB();

const app = express();

// Security Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: { success: false, message: 'Too many login/registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/medicine', require('./routes/medicineRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MedReminder PWA API server is operational' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize node-cron background reminder scheduler
initCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[MedReminder Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}]`);
});
