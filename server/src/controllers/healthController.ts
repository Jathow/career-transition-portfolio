import { Request, Response } from 'express';
import { testDatabaseConnection } from '../utils/dbHealth';

export const healthCheck = async (req: Request, res: Response) => {
  const dbHealth = await testDatabaseConnection();
  
  res.status(dbHealth.success ? 200 : 500).json({
    status: dbHealth.success ? 'healthy' : 'unhealthy',
    database: dbHealth.success ? 'connected' : 'disconnected',
    error: dbHealth.error || null,
    tables: dbHealth.tables || null,
    timestamp: new Date().toISOString()
  });
};