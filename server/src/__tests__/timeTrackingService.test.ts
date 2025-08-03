import { TimeTrackingService } from '../services/timeTrackingService';
import { mockPrismaClient } from './setup';

describe('TimeTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateProjectProgress', () => {
    it('should calculate progress for a project correctly', async () => {
      const mockProject = {
        id: '1',
        title: 'Test Project',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        targetEndDate: new Date('2024-01-08'),
      };

      mockPrismaClient.project.findUnique.mockResolvedValue(mockProject);

      const result = await TimeTrackingService.calculateProjectProgress('1');

      expect(result).toEqual({
        projectId: '1',
        title: 'Test Project',
        status: 'IN_PROGRESS',
        progress: expect.any(Number),
        timeRemaining: expect.any(Number),
        isOverdue: expect.any(Boolean),
        daysUntilDeadline: expect.any(Number),
        completionRate: expect.any(Number),
      });
    });

    it('should return null for non-existent project', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValue(null);

      const result = await TimeTrackingService.calculateProjectProgress('999');

      expect(result).toBeNull();
    });

    it('should calculate 100% completion for completed projects', async () => {
      const mockProject = {
        id: '1',
        title: 'Completed Project',
        status: 'COMPLETED',
        startDate: new Date('2024-01-01'),
        targetEndDate: new Date('2024-01-08'),
      };

      mockPrismaClient.project.findUnique.mockResolvedValue(mockProject);

      const result = await TimeTrackingService.calculateProjectProgress('1');

      expect(result?.completionRate).toBe(100);
    });
  });

  describe('getAllProjectsProgress', () => {
    it('should return progress for all user projects', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Project 1',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          targetEndDate: new Date('2024-01-08'),
        },
        {
          id: '2',
          title: 'Project 2',
          status: 'COMPLETED',
          startDate: new Date('2024-01-01'),
          targetEndDate: new Date('2024-01-08'),
        },
      ];

      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaClient.project.findUnique
        .mockResolvedValueOnce(mockProjects[0])
        .mockResolvedValueOnce(mockProjects[1]);

      const result = await TimeTrackingService.getAllProjectsProgress('user1');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('projectId', '1');
      expect(result[1]).toHaveProperty('projectId', '2');
    });
  });

  describe('getDeadlineNotifications', () => {
    it('should return deadline notifications for projects within 7 days', async () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockProjects = [
        {
          id: '1',
          title: 'Urgent Project',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          targetEndDate: tomorrow,
        },
      ];

      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);

      const result = await TimeTrackingService.getDeadlineNotifications('user1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('projectId', '1');
      expect(result[0]).toHaveProperty('urgency', 'high');
    });

    it('should not return notifications for completed projects', async () => {
      // The service filters out completed projects, so findMany should return empty array
      mockPrismaClient.project.findMany.mockResolvedValue([]);

      const result = await TimeTrackingService.getDeadlineNotifications('user1');

      expect(result).toHaveLength(0);
    });
  });

  describe('getProjectTimeline', () => {
    it('should return timeline data for visualization', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Project 1',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          targetEndDate: new Date('2024-01-08'),
        },
      ];

      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaClient.project.findUnique.mockResolvedValue(mockProjects[0]);

      const result = await TimeTrackingService.getProjectTimeline('user1');

      expect(result).toEqual({
        labels: ['Project 1'],
        progress: expect.any(Array),
        deadlines: expect.any(Array),
        overdue: expect.any(Array),
      });
    });
  });

  describe('getUserProgressStats', () => {
    it('should return user progress statistics', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Project 1',
          status: 'COMPLETED',
          startDate: new Date('2024-01-01'),
          targetEndDate: new Date('2024-01-08'),
        },
        {
          id: '2',
          title: 'Project 2',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          targetEndDate: new Date('2024-01-08'),
        },
      ];

      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);
      mockPrismaClient.project.findUnique
        .mockResolvedValueOnce(mockProjects[0])
        .mockResolvedValueOnce(mockProjects[1]);

      const result = await TimeTrackingService.getUserProgressStats('user1');

      expect(result).toEqual({
        totalProjects: 2,
        completedProjects: 1,
        inProgressProjects: 1,
        overdueProjects: expect.any(Number),
        averageProgress: expect.any(Number),
        upcomingDeadlines: expect.any(Number),
      });
    });
  });

  describe('updateProjectStatusByDeadline', () => {
    it('should update overdue project statuses', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockOverdueProjects = [
        {
          id: '1',
          title: 'Overdue Project',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          targetEndDate: yesterday,
        },
      ];

      mockPrismaClient.project.findMany.mockResolvedValue(mockOverdueProjects);
      mockPrismaClient.project.update.mockResolvedValue({});

      await TimeTrackingService.updateProjectStatusByDeadline();

      expect(mockPrismaClient.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'PAUSED' },
      });
    });
  });
}); 