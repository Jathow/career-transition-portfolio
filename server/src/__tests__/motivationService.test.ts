import { MotivationService } from '../services/motivationService';
import { mockPrismaClient } from './setup';

describe('MotivationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logDailyActivity', () => {
    it('should create a new daily log when none exists', async () => {
      const logData = {
        userId: 'user123',
        date: '2024-01-01',
        codingMinutes: 120,
        applicationsSubmitted: 3,
        learningMinutes: 60,
        notes: 'Great day!',
        mood: 'excellent',
        energyLevel: 8,
        productivity: 9,
        challenges: 'None',
        achievements: 'Completed project setup',
      };

      mockPrismaClient.dailyLog.findUnique.mockResolvedValue(null);
      mockPrismaClient.dailyLog.create.mockResolvedValue({ id: 'log123', ...logData });

      const result = await MotivationService.logDailyActivity(logData);

      expect(mockPrismaClient.dailyLog.findUnique).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: 'user123',
            date: new Date('2024-01-01'),
          },
        },
      });
      expect(mockPrismaClient.dailyLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          date: new Date('2024-01-01'),
          codingMinutes: 120,
          applicationsSubmitted: 3,
          learningMinutes: 60,
          notes: 'Great day!',
          mood: 'excellent',
          energyLevel: 8,
          productivity: 9,
          challenges: 'None',
          achievements: 'Completed project setup',
        },
      });
      expect(result).toEqual({ id: 'log123', ...logData });
    });

    it('should update existing daily log when one exists', async () => {
      const logData = {
        userId: 'user123',
        date: '2024-01-01',
        codingMinutes: 180,
        applicationsSubmitted: 5,
        learningMinutes: 90,
        notes: 'Updated notes',
        mood: 'good',
        energyLevel: 7,
        productivity: 8,
        challenges: 'Some challenges',
        achievements: 'More achievements',
      };

      const existingLog = {
        id: 'log123',
        userId: 'user123',
        date: new Date('2024-01-01'),
        codingMinutes: 60,
        applicationsSubmitted: 2,
        learningMinutes: 30,
        notes: 'Original notes',
        mood: 'okay',
        energyLevel: 6,
        productivity: 7,
        challenges: 'Some issues',
        achievements: 'Started project',
      };

      mockPrismaClient.dailyLog.findUnique.mockResolvedValue(existingLog);
      mockPrismaClient.dailyLog.update.mockResolvedValue({ id: 'log123', ...logData });

      const result = await MotivationService.logDailyActivity(logData);

      expect(mockPrismaClient.dailyLog.update).toHaveBeenCalledWith({
        where: { id: 'log123' },
        data: {
          codingMinutes: 180,
          applicationsSubmitted: 5,
          learningMinutes: 90,
          notes: 'Updated notes',
          mood: 'good',
          energyLevel: 7,
          productivity: 8,
          challenges: 'Some challenges',
          achievements: 'More achievements',
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ id: 'log123', ...logData });
    });
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'Complete Portfolio Project',
        description: 'Build a full-stack application',
        type: 'weekly' as const,
        targetValue: 20,
        unit: 'hours',
        priority: 'HIGH' as const,
        endDate: '2024-01-07',
      };

      const createdGoal = {
        id: 'goal123',
        userId: 'user123',
        ...goalData,
        endDate: new Date('2024-01-07'),
        status: 'ACTIVE',
        currentValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.goal.create.mockResolvedValue(createdGoal);

      const result = await MotivationService.createGoal('user123', goalData);

      expect(mockPrismaClient.goal.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          title: 'Complete Portfolio Project',
          description: 'Build a full-stack application',
          type: 'weekly',
          targetValue: 20,
          unit: 'hours',
          priority: 'HIGH',
          endDate: new Date('2024-01-07'),
        },
      });
      expect(result).toEqual(createdGoal);
    });
  });

  describe('getActiveGoals', () => {
    it('should return active goals for a user', async () => {
      const mockGoals = [
        {
          id: 'goal1',
          title: 'Goal 1',
          status: 'ACTIVE',
          priority: 'HIGH',
          endDate: new Date('2024-01-07'),
        },
        {
          id: 'goal2',
          title: 'Goal 2',
          status: 'ACTIVE',
          priority: 'MEDIUM',
          endDate: new Date('2024-01-10'),
        },
      ];

      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);

      const result = await MotivationService.getActiveGoals('user123');

      expect(mockPrismaClient.goal.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          status: 'ACTIVE',
        },
        orderBy: [
          { priority: 'desc' },
          { endDate: 'asc' },
        ],
      });
      expect(result).toEqual(mockGoals);
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress and mark as completed when target is reached', async () => {
      const goal = {
        id: 'goal123',
        title: 'Test Goal',
        targetValue: 100,
        currentValue: 50,
        status: 'ACTIVE',
      };

      mockPrismaClient.goal.findUnique.mockResolvedValue(goal);
      mockPrismaClient.goal.update.mockResolvedValue({
        ...goal,
        currentValue: 100,
        status: 'COMPLETED',
      });

      const result = await MotivationService.updateGoalProgress('goal123', 100);

      expect(mockPrismaClient.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal123' },
        data: {
          currentValue: 100,
          status: 'COMPLETED',
          updatedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('COMPLETED');
    });

    it('should update goal progress without marking as completed when target is not reached', async () => {
      const goal = {
        id: 'goal123',
        title: 'Test Goal',
        targetValue: 100,
        currentValue: 50,
        status: 'ACTIVE',
      };

      mockPrismaClient.goal.findUnique.mockResolvedValue(goal);
      mockPrismaClient.goal.update.mockResolvedValue({
        ...goal,
        currentValue: 75,
        status: 'ACTIVE',
      });

      const result = await MotivationService.updateGoalProgress('goal123', 75);

      expect(mockPrismaClient.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal123' },
        data: {
          currentValue: 75,
          status: 'ACTIVE',
          updatedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('getProgressStats', () => {
    it('should calculate progress statistics correctly', async () => {
      const mockLogs = [
        {
          codingMinutes: 120,
          applicationsSubmitted: 3,
          learningMinutes: 60,
          mood: 'excellent',
          energyLevel: 8,
          productivity: 9,
        },
        {
          codingMinutes: 180,
          applicationsSubmitted: 5,
          learningMinutes: 90,
          mood: 'good',
          energyLevel: 7,
          productivity: 8,
        },
      ];

      const mockGoals: any[] = [];
      const mockAchievements: any[] = [];

      mockPrismaClient.dailyLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);
      mockPrismaClient.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await MotivationService.getProgressStats('user123');

      expect(result).toEqual({
        totalCodingHours: 5, // (120 + 180) / 60
        totalApplications: 8, // 3 + 5
        totalLearningHours: 2.5, // (60 + 90) / 60
        averageDailyCoding: 2.5, // 5 / 2
        averageDailyApplications: 4, // 8 / 2
        averageDailyLearning: 1.25, // 2.5 / 2
        currentStreak: expect.any(Number),
        longestStreak: expect.any(Number),
        goalsCompleted: 0,
        goalsActive: 0,
        achievementsUnlocked: 0,
        moodTrend: expect.any(String),
        productivityTrend: expect.any(String),
      });
    });
  });

  describe('generateStrategicGuidance', () => {
    it('should generate guidance based on user deadline and progress', async () => {
      const mockUser = {
        id: 'user123',
        jobSearchDeadline: new Date('2024-12-31'),
      };

      const mockLogs = [
        {
          applicationsSubmitted: 1, // Low applications
          codingMinutes: 30, // Low coding time
        },
      ];

      const mockGoals: any[] = [];
      const mockAchievements: any[] = [];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.dailyLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);
      mockPrismaClient.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await MotivationService.generateStrategicGuidance('user123');

      expect(result.length).toBeGreaterThan(0); // Should have some guidance
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('message');
    });

    it('should return empty array when user has no deadline', async () => {
      const mockUser = {
        id: 'user123',
        targetJobDeadline: null,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await MotivationService.generateStrategicGuidance('user123');

      expect(result).toEqual([]);
    });
  });

  describe('getProgressStats - streak calculations', () => {
    it('should calculate current streak correctly', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockLogs = [
        { 
          date: today,
          codingMinutes: 120,
          applicationsSubmitted: 2,
          learningMinutes: 60
        },
        { 
          date: yesterday,
          codingMinutes: 90,
          applicationsSubmitted: 1,
          learningMinutes: 30
        },
        { 
          date: twoDaysAgo,
          codingMinutes: 180,
          applicationsSubmitted: 3,
          learningMinutes: 90
        },
      ];

      const mockGoals: any[] = [];
      const mockAchievements: any[] = [];

      mockPrismaClient.dailyLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);
      mockPrismaClient.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await MotivationService.getProgressStats('user123');

      expect(result.currentStreak).toBe(3);
    });

    it('should return 0 for empty logs', async () => {
      const mockGoals: any[] = [];
      const mockAchievements: any[] = [];

      mockPrismaClient.dailyLog.findMany.mockResolvedValue([]);
      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);
      mockPrismaClient.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await MotivationService.getProgressStats('user123');

      expect(result.currentStreak).toBe(0);
    });

    it('should calculate longest streak correctly', async () => {
      const mockLogs = [
        { 
          date: new Date('2024-01-05'),
          codingMinutes: 120,
          applicationsSubmitted: 2,
          learningMinutes: 60
        },
        { 
          date: new Date('2024-01-04'),
          codingMinutes: 90,
          applicationsSubmitted: 1,
          learningMinutes: 30
        },
        { 
          date: new Date('2024-01-03'),
          codingMinutes: 180,
          applicationsSubmitted: 3,
          learningMinutes: 90
        },
        { 
          date: new Date('2024-01-02'),
          codingMinutes: 150,
          applicationsSubmitted: 2,
          learningMinutes: 45
        },
        { 
          date: new Date('2024-01-01'),
          codingMinutes: 200,
          applicationsSubmitted: 4,
          learningMinutes: 120
        },
      ];

      const mockGoals: any[] = [];
      const mockAchievements: any[] = [];

      mockPrismaClient.dailyLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaClient.goal.findMany.mockResolvedValue(mockGoals);
      mockPrismaClient.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await MotivationService.getProgressStats('user123');

      expect(result.longestStreak).toBe(5);
    });
  });
}); 