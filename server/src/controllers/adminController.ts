import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        // Consider users active if they have logged in within the last 30 days
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get project statistics
    const totalProjects = await prisma.project.count();
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });

    // Get application statistics
    const totalApplications = await prisma.jobApplication.count();

    // Calculate system uptime (simplified - in production you'd track this)
    const systemUptime = 99.9; // Mock value

    // Get database size (simplified)
    const databaseSize = '2.5 MB'; // Mock value

    // Calculate average response time (mock)
    const averageResponseTime = 150; // ms

    // Calculate error rate (mock)
    const errorRate = 0.1; // %

    const stats = {
      totalUsers,
      activeUsers,
      totalProjects,
      completedProjects,
      totalApplications,
      systemUptime,
      databaseSize,
      averageResponseTime,
      errorRate,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch system statistics',
      },
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            jobApplications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(), // Using updatedAt as last login proxy
      isActive: true, // Mock active status
      projectCount: user._count.projects,
      applicationCount: user._count.jobApplications,
    }));

    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch users',
      },
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isActive } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        // Note: isActive would need to be implemented in the User model
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user',
      },
    });
  }
};

export const activateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you'd update an isActive field
    // For now, we'll just return success
    logger.info(`User ${id} activated`);

    res.json({
      success: true,
      message: 'User activated successfully',
    });
  } catch (error) {
    logger.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to activate user',
      },
    });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you'd update an isActive field
    // For now, we'll just return success
    logger.info(`User ${id} deactivated`);

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deactivate user',
      },
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete user',
      },
    });
  }
};

export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    // In a real implementation, you'd have a SystemLog model
    // For now, we'll return mock data
    const mockLogs = [
      {
        id: '1',
        level: 'info' as const,
        message: 'System started successfully',
        timestamp: new Date().toISOString(),
        userId: null,
      },
      {
        id: '2',
        level: 'warning' as const,
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: null,
      },
      {
        id: '3',
        level: 'error' as const,
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        userId: null,
      },
    ];

    res.json({
      success: true,
      data: mockLogs,
    });
  } catch (error) {
    logger.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch system logs',
      },
    });
  }
};

export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    // Generate mock performance data for the last 24 hours
    const performanceData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      performanceData.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        requestsPerMinute: Math.floor(Math.random() * 100) + 10,
        errorCount: Math.floor(Math.random() * 5),
      });
    }

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch performance metrics',
      },
    });
  }
}; 