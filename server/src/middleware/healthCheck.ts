import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    external: HealthCheck;
  };
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: any;
}

// Memory usage check
function checkMemoryUsage(): HealthCheck {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  // Consider unhealthy if RSS > 1GB or heap used > 500MB
  if (memUsageMB.rss > 1024 || memUsageMB.heapUsed > 500) {
    return {
      status: 'unhealthy',
      message: 'Memory usage is too high',
      details: memUsageMB
    };
  }

  // Consider degraded if RSS > 512MB or heap used > 250MB
  if (memUsageMB.rss > 512 || memUsageMB.heapUsed > 250) {
    return {
      status: 'degraded',
      message: 'Memory usage is elevated',
      details: memUsageMB
    };
  }

  return {
    status: 'healthy',
    message: 'Memory usage is normal',
    details: memUsageMB
  };
}

// Database connectivity check
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Log DATABASE_URL status for debugging
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const databaseUrlLength = process.env.DATABASE_URL?.length || 0;
    const startsWithPostgres = process.env.DATABASE_URL?.startsWith('postgres');
    
    logger.info('Database health check - environment info', {
      hasDatabaseUrl,
      databaseUrlLength,
      startsWithPostgres,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    // Consider degraded if response time > 1000ms
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        message: 'Database response time is slow',
        responseTime,
        details: { responseTimeMs: responseTime }
      };
    }

    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      responseTime,
      details: { responseTimeMs: responseTime }
    };
  } catch (error: any) {
    logger.error('Database health check failed', { 
      error: error.message,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0
    });
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      details: { error: error.message }
    };
  }
}

// Disk space check (simplified for demo)
function checkDiskSpace(): HealthCheck {
  // In a real implementation, you would check actual disk space
  // For demo purposes, we'll simulate a healthy disk
  return {
    status: 'healthy',
    message: 'Disk space is sufficient',
    details: { availableSpace: '10GB' }
  };
}

// External services check
async function checkExternalServices(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if we can reach external services (example: GitHub API)
    const response = await fetch('https://api.github.com/zen', {
      method: 'GET'
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: 'healthy',
        message: 'External services are accessible',
        responseTime,
        details: { responseTimeMs: responseTime }
      };
    } else {
      return {
        status: 'degraded',
        message: 'External services are responding slowly',
        responseTime,
        details: { statusCode: response.status }
      };
    }
  } catch (error: any) {
    return {
      status: 'degraded',
      message: 'External services are unavailable',
      details: { error: error.message }
    };
  }
}

// Main health check handler
export const healthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Run all health checks
    const [dbCheck, memoryCheck, diskCheck, externalCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemoryUsage()),
      Promise.resolve(checkDiskSpace()),
      checkExternalServices()
    ]);

    // Determine overall status
    const checks = { database: dbCheck, memory: memoryCheck, disk: diskCheck, external: externalCheck };
    const overallStatus = determineOverallStatus(checks);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks
    };

    // Log health check results
    logger.info('Health check completed', {
      status: overallStatus,
      responseTime: Date.now() - startTime,
      checks: Object.keys(checks).reduce((acc: Record<string, string>, key: string) => {
        acc[key] = (checks as any)[key].status;
        return acc;
      }, {})
    });

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);

  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'unhealthy', message: 'Health check failed' },
        memory: { status: 'unhealthy', message: 'Health check failed' },
        disk: { status: 'unhealthy', message: 'Health check failed' },
        external: { status: 'unhealthy', message: 'Health check failed' }
      }
    };

    res.status(503).json(errorStatus);
  }
};

// Determine overall health status
function determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  
  if (statuses.includes('degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

// Simple health check for load balancers
export const simpleHealthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

// Readiness check for Kubernetes
export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Check if the application is ready to serve traffic
    const dbCheck = await checkDatabase();
    
    if (dbCheck.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not ready'
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Health check failed'
    });
  }
};

// Liveness check for Kubernetes
export const livenessCheck = (req: Request, res: Response) => {
  // Simple check to see if the process is alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}; 