import { NotificationService } from '../services/notificationService';
import { mockPrismaClient } from './setup';

// Mock TimeTrackingService
jest.mock('../services/timeTrackingService', () => ({
  TimeTrackingService: {
    getDeadlineNotifications: jest.fn(),
  },
}));

// Import the mocked modules
import { TimeTrackingService } from '../services/timeTrackingService';

describe('NotificationService', () => {
  let mockTimeTrackingService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimeTrackingService = TimeTrackingService;
  });

  describe('createNotification', () => {
    it('should create a notification with template', async () => {
      const mockNotification = {
        id: '1',
        userId: 'user1',
        type: 'deadline',
        title: 'Deadline Approaching',
        message: 'Your project "Test Project" is due in 3 days.',
        priority: 'medium',
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({ projectTitle: 'Test Project', days: 3 }),
      };

      mockPrismaClient.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification(
        'user1',
        'deadline_approaching',
        { projectTitle: 'Test Project', days: 3 }
      );

      expect(result).toEqual({
        ...mockNotification,
        type: 'deadline',
        priority: 'medium',
        metadata: { projectTitle: 'Test Project', days: 3 },
      });
    });

    it('should throw error for invalid template', async () => {
      await expect(
        NotificationService.createNotification('user1', 'invalid_template', {})
      ).rejects.toThrow("Notification template 'invalid_template' not found");
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: 'user1',
          type: 'deadline',
          title: 'Deadline Approaching',
          message: 'Your project is due soon.',
          priority: 'medium',
          read: false,
          createdAt: new Date(),
          metadata: null,
        },
      ];

      mockPrismaClient.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationService.getUserNotifications('user1');

      expect(result).toEqual([
        {
          ...mockNotifications[0],
          type: 'deadline',
          priority: 'medium',
          metadata: undefined,
        },
      ]);
    });

    it('should filter unread notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: 'user1',
          type: 'deadline',
          title: 'Deadline Approaching',
          message: 'Your project is due soon.',
          priority: 'medium',
          read: false,
          createdAt: new Date(),
          metadata: null,
        },
      ];

      mockPrismaClient.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationService.getUserNotifications('user1', { unreadOnly: true });

      expect(result).toEqual([
        {
          ...mockNotifications[0],
          type: 'deadline',
          priority: 'medium',
          metadata: undefined,
        },
      ]);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrismaClient.notification.updateMany.mockResolvedValue({ count: 1 });

      await NotificationService.markAsRead('notification1', 'user1');

      expect(mockPrismaClient.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'notification1',
          userId: 'user1',
        },
        data: {
          read: true,
        },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPrismaClient.notification.updateMany.mockResolvedValue({ count: 5 });

      await NotificationService.markAllAsRead('user1');

      expect(mockPrismaClient.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          read: false,
        },
        data: {
          read: true,
        },
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockPrismaClient.notification.deleteMany.mockResolvedValue({ count: 1 });

      await NotificationService.deleteNotification('notification1', 'user1');

      expect(mockPrismaClient.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'notification1',
          userId: 'user1',
        },
      });
    });
  });

  describe('getNotificationCount', () => {
    it('should return notification count', async () => {
      mockPrismaClient.notification.count.mockResolvedValue(5);

      const result = await NotificationService.getNotificationCount('user1');

      expect(result).toBe(5);
      expect(mockPrismaClient.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should return unread notification count', async () => {
      mockPrismaClient.notification.count.mockResolvedValue(2);

      const result = await NotificationService.getNotificationCount('user1', true);

      expect(result).toBe(2);
      expect(mockPrismaClient.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user1', read: false },
      });
    });
  });

  describe('processDeadlineNotifications', () => {
    it('should create deadline notifications', async () => {
      const mockDeadlines = [
        {
          projectId: 'project1',
          title: 'Test Project',
          daysUntilDeadline: 3,
          isOverdue: false,
          urgency: 'medium' as const,
        },
      ];

      mockTimeTrackingService.getDeadlineNotifications.mockResolvedValue(mockDeadlines);
      mockPrismaClient.notification.create.mockResolvedValue({
        id: 'notification1',
        userId: 'user1',
        type: 'deadline',
        title: 'Deadline Approaching',
        message: 'Your project "Test Project" is due in 3 days.',
        priority: 'medium',
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({ projectTitle: 'Test Project', days: 3 }),
      });

      await NotificationService.processDeadlineNotifications('user1');

      expect(mockTimeTrackingService.getDeadlineNotifications).toHaveBeenCalledWith('user1');
      expect(mockPrismaClient.notification.create).toHaveBeenCalled();
    });
  });

  describe('createMilestoneNotification', () => {
    it('should create milestone notification', async () => {
      mockPrismaClient.notification.create.mockResolvedValue({
        id: 'notification1',
        userId: 'user1',
        type: 'milestone',
        title: 'Milestone Achieved',
        message: 'Congratulations! You\'ve completed 50% for "Test Project".',
        priority: 'low',
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({ projectTitle: 'Test Project', milestone: '50%' }),
      });

      await NotificationService.createMilestoneNotification('user1', 'Test Project', '50%');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'milestone',
          title: 'Milestone Achieved',
          message: 'Congratulations! You\'ve completed 50% for "Test Project".',
          priority: 'low',
          read: false,
          metadata: JSON.stringify({ projectTitle: 'Test Project', milestone: '50%' }),
        },
      });
    });
  });

  describe('createProjectCompletionNotification', () => {
    it('should create project completion notification', async () => {
      mockPrismaClient.notification.create.mockResolvedValue({
        id: 'notification1',
        userId: 'user1',
        type: 'milestone',
        title: 'Project Completed',
        message: 'Great job! You\'ve successfully completed "Test Project".',
        priority: 'low',
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({ projectTitle: 'Test Project' }),
      });

      await NotificationService.createProjectCompletionNotification('user1', 'Test Project');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'milestone',
          title: 'Project Completed',
          message: 'Great job! You\'ve successfully completed "Test Project".',
          priority: 'low',
          read: false,
          metadata: JSON.stringify({ projectTitle: 'Test Project' }),
        },
      });
    });
  });

  describe('createProgressNotification', () => {
    it('should create progress notification for milestone percentages', async () => {
      mockPrismaClient.notification.create.mockResolvedValue({
        id: 'notification1',
        userId: 'user1',
        type: 'progress',
        title: 'Progress Update',
        message: 'Your project "Test Project" is 75% complete.',
        priority: 'low',
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({ projectTitle: 'Test Project', progress: 75 }),
      });

      await NotificationService.createProgressNotification('user1', 'Test Project', 75);

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'progress',
          title: 'Progress Update',
          message: 'Your project "Test Project" is 75% complete.',
          priority: 'low',
          read: false,
          metadata: JSON.stringify({ projectTitle: 'Test Project', progress: 75 }),
        },
      });
    });

    it('should not create notification for non-milestone percentages', async () => {
      await NotificationService.createProgressNotification('user1', 'Test Project', 23);

      expect(mockPrismaClient.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should delete old read notifications', async () => {
      mockPrismaClient.notification.deleteMany.mockResolvedValue({ count: 10 });

      await NotificationService.cleanupOldNotifications();

      expect(mockPrismaClient.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
          read: true,
        },
      });
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification statistics', async () => {
      const mockNotifications = [
        { type: 'deadline', read: false, priority: 'medium' },
        { type: 'milestone', read: true, priority: 'low' },
        { type: 'progress', read: false, priority: 'low' },
      ];

      mockPrismaClient.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationService.getNotificationStats('user1');

      expect(result).toEqual({
        total: 3,
        unread: 2,
        byPriority: { medium: 1, low: 2 },
        byType: {
          deadline: 1,
          milestone: 1,
          progress: 1,
        },
      });
    });
  });
}); 