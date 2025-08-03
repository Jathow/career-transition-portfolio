import { PrismaClient } from '@prisma/client';
import { TimeTrackingService, DeadlineNotification } from './timeTrackingService';

const prisma = new PrismaClient();

export interface Notification {
  id: string;
  userId: string;
  type: 'deadline' | 'milestone' | 'progress' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class NotificationService {
  private static notificationTemplates: Record<string, NotificationTemplate> = {
    deadline_approaching: {
      type: 'deadline',
      title: 'Deadline Approaching',
      message: 'Your project "{projectTitle}" is due in {days} days.',
      priority: 'medium'
    },
    deadline_overdue: {
      type: 'deadline',
      title: 'Project Overdue',
      message: 'Your project "{projectTitle}" is overdue by {days} days.',
      priority: 'critical'
    },
    milestone_reached: {
      type: 'milestone',
      title: 'Milestone Achieved',
      message: 'Congratulations! You\'ve completed {milestone} for "{projectTitle}".',
      priority: 'low'
    },
    project_completed: {
      type: 'milestone',
      title: 'Project Completed',
      message: 'Great job! You\'ve successfully completed "{projectTitle}".',
      priority: 'low'
    },
    progress_update: {
      type: 'progress',
      title: 'Progress Update',
      message: 'Your project "{projectTitle}" is {progress}% complete.',
      priority: 'low'
    },
    system_maintenance: {
      type: 'system',
      title: 'System Notice',
      message: 'System maintenance scheduled for {date}.',
      priority: 'medium'
    }
  };

  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    templateKey: string,
    metadata: Record<string, any> = {}
  ): Promise<Notification> {
    const template = this.notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Notification template '${templateKey}' not found`);
    }

    let title = template.title;
    let message = template.message;

    // Replace placeholders in title and message
    for (const [key, value] of Object.entries(metadata)) {
      const placeholder = `{${key}}`;
      title = title.replace(placeholder, String(value));
      message = message.replace(placeholder, String(value));
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: template.type,
        title,
        message,
        priority: template.priority,
        read: false,
        metadata: JSON.stringify(metadata)
      }
    });

    return {
      ...notification,
      type: notification.type as 'deadline' | 'milestone' | 'progress' | 'system',
      priority: notification.priority as 'low' | 'medium' | 'high' | 'critical',
      metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined
    };
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return notifications.map((notification: any) => ({
      ...notification,
      type: notification.type as 'deadline' | 'milestone' | 'progress' | 'system',
      priority: notification.priority as 'low' | 'medium' | 'high' | 'critical',
      metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined
    }));
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        read: true
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
  }

  /**
   * Get notification count
   */
  static async getNotificationCount(userId: string, unreadOnly: boolean = false): Promise<number> {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return await prisma.notification.count({ where });
  }

  /**
   * Process deadline notifications for a user
   */
  static async processDeadlineNotifications(userId: string): Promise<void> {
    const deadlineNotifications = await TimeTrackingService.getDeadlineNotifications(userId);

    for (const notification of deadlineNotifications) {
      if (notification.isOverdue) {
        await this.createNotification(
          userId,
          'deadline_overdue',
          {
            projectTitle: notification.title,
            days: Math.abs(notification.daysUntilDeadline)
          }
        );
      } else {
        await this.createNotification(
          userId,
          'deadline_approaching',
          {
            projectTitle: notification.title,
            days: notification.daysUntilDeadline
          }
        );
      }
    }
  }

  /**
   * Create milestone notification
   */
  static async createMilestoneNotification(
    userId: string,
    projectTitle: string,
    milestone: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'milestone_reached',
      {
        projectTitle,
        milestone
      }
    );
  }

  /**
   * Create project completion notification
   */
  static async createProjectCompletionNotification(
    userId: string,
    projectTitle: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'project_completed',
      {
        projectTitle
      }
    );
  }

  /**
   * Create progress update notification
   */
  static async createProgressNotification(
    userId: string,
    projectTitle: string,
    progress: number
  ): Promise<void> {
    // Only create progress notifications for significant milestones (25%, 50%, 75%)
    if (progress >= 25 && progress % 25 === 0) {
      await this.createNotification(
        userId,
        'progress_update',
        {
          projectTitle,
          progress
        }
      );
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  static async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        read: true
      }
    });
  }

  /**
   * Get notification statistics for a user
   */
  static async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const notifications = await this.getUserNotifications(userId, { limit: 1000 });

    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};

    notifications.forEach(notification => {
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
      byType[notification.type] = (byType[notification.type] || 0) + 1;
    });

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byPriority,
      byType
    };
  }
} 