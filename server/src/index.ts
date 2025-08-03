import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, uploadLimiter, adminLimiter } from './middleware/rateLimiter';
import { healthCheck, simpleHealthCheck, readinessCheck, livenessCheck } from './middleware/healthCheck';
import { authRoutes } from './routes/auth';
import projectRoutes from './routes/projects';
import timeTrackingRoutes from './routes/timeTracking';
import notificationRoutes from './routes/notifications';
import resumeRoutes from './routes/resumes';
import jobApplicationRoutes from './routes/jobApplications';
import interviewRoutes from './routes/interviews';
import portfolioRoutes from './routes/portfolio';
import motivationRoutes from './routes/motivation';
import marketAnalysisRoutes from './routes/marketAnalysis';
import revenueTrackingRoutes from './routes/revenueTracking';
import adminRoutes from './routes/admin';
import preferencesRoutes from './routes/preferences';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/simple', simpleHealthCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);
app.get('/api/health', simpleHealthCheck);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/motivation', motivationRoutes);
app.use('/api/market-analysis', marketAnalysisRoutes);
app.use('/api/revenue-tracking', revenueTrackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/preferences', preferencesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handler
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
  });
}

export default app;