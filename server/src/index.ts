import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
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
import analyticsRoutes from './routes/analytics';
import feedbackRoutes from './routes/feedback';
// Templates routes removed

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware with relaxed CSP for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000',
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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
// Template import/export endpoints removed

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  
  // Try multiple possible paths for client build
  const possiblePaths = [
    path.join(__dirname, '../../client/build'),
    path.join(process.cwd(), 'client/build'),
    '/app/client/build'
  ];
  
  let clientBuildPath = '';
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
      clientBuildPath = testPath;
      break;
    }
  }
  
  // Debug: Log paths and check if files exist
  logger.info('Static file serving setup:', {
    __dirname,
    'process.cwd()': process.cwd(),
    possiblePaths,
    selectedPath: clientBuildPath,
    indexExists: clientBuildPath ? fs.existsSync(path.join(clientBuildPath, 'index.html')) : false
  });
  
  if (clientBuildPath) {
    // List contents of client build directory
    try {
      const files = fs.readdirSync(clientBuildPath);
      logger.info('Client build directory contents:', files);
    } catch (error) {
      logger.error('Error reading client build directory:', error);
    }
    
    app.use(express.static(clientBuildPath));
    
    // Handle React Router - send all non-API requests to React app
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        const indexPath = path.join(clientBuildPath, 'index.html');
        res.sendFile(indexPath);
      } else {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API endpoint not found',
            timestamp: new Date().toISOString()
          }
        });
      }
    });
  } else {
    logger.error('No valid client build path found. Checked paths:', possiblePaths);
    
    // Fallback - serve a basic error page
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.status(500).json({
          success: false,
          error: {
            code: 'BUILD_NOT_FOUND',
            message: 'Client build files not found',
            timestamp: new Date().toISOString(),
            checkedPaths: possiblePaths
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API endpoint not found',
            timestamp: new Date().toISOString()
          }
        });
      }
    });
  }
} else {
  // 404 handler for development
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
}

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