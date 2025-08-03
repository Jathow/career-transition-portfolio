import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface DailyActivityLog {
  userId: string;
  date: string;
  codingMinutes: number;
  applicationsSubmitted: number;
  learningMinutes: number;
  notes?: string;
  mood?: string;
  energyLevel?: number;
  productivity?: number;
  challenges?: string;
  achievements?: string;
}

export interface GoalData {
  title: string;
  description?: string;
  type: 'weekly' | 'monthly' | 'custom';
  targetValue: number;
  unit: string;
  endDate: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ProgressStats {
  totalCodingHours: number;
  totalApplications: number;
  totalLearningHours: number;
  averageDailyCoding: number;
  averageDailyApplications: number;
  averageDailyLearning: number;
  currentStreak: number;
  longestStreak: number;
  goalsCompleted: number;
  goalsActive: number;
  achievementsUnlocked: number;
  moodTrend: string;
  productivityTrend: string;
}

export interface MotivationalMessage {
  type: 'encouragement' | 'celebration' | 'guidance' | 'warning';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class MotivationService {
  /**
   * Log daily activity
   */
  static async logDailyActivity(logData: DailyActivityLog): Promise<any> {
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: logData.userId,
          date: new Date(logData.date)
        }
      }
    });

    if (existingLog) {
      return await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          codingMinutes: logData.codingMinutes,
          applicationsSubmitted: logData.applicationsSubmitted,
          learningMinutes: logData.learningMinutes,
          notes: logData.notes,
          mood: logData.mood,
          energyLevel: logData.energyLevel,
          productivity: logData.productivity,
          challenges: logData.challenges,
          achievements: logData.achievements,
          updatedAt: new Date()
        }
      });
    }

    return await prisma.dailyLog.create({
      data: {
        userId: logData.userId,
        date: new Date(logData.date),
        codingMinutes: logData.codingMinutes,
        applicationsSubmitted: logData.applicationsSubmitted,
        learningMinutes: logData.learningMinutes,
        notes: logData.notes,
        mood: logData.mood,
        energyLevel: logData.energyLevel,
        productivity: logData.productivity,
        challenges: logData.challenges,
        achievements: logData.achievements
      }
    });
  }

  /**
   * Get daily activity logs for a date range
   */
  static async getDailyLogs(userId: string, startDate: string, endDate: string): Promise<any[]> {
    return await prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  /**
   * Create a new goal
   */
  static async createGoal(userId: string, goalData: GoalData): Promise<any> {
    return await prisma.goal.create({
      data: {
        userId,
        title: goalData.title,
        description: goalData.description,
        type: goalData.type,
        targetValue: goalData.targetValue,
        unit: goalData.unit,
        endDate: new Date(goalData.endDate),
        priority: goalData.priority || 'MEDIUM'
      }
    });
  }

  /**
   * Get user's active goals
   */
  static async getActiveGoals(userId: string): Promise<any[]> {
    return await prisma.goal.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      orderBy: [
        { priority: 'desc' },
        { endDate: 'asc' }
      ]
    });
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(goalId: string, currentValue: number): Promise<any> {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const isCompleted = currentValue >= goal.targetValue;
    const status = isCompleted ? 'COMPLETED' : 'ACTIVE';

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue,
        status,
        updatedAt: new Date()
      }
    });

    // If goal is completed, create achievement
    if (isCompleted && goal.status !== 'COMPLETED') {
      await this.createAchievement(goal.userId, {
        title: `Goal Completed: ${goal.title}`,
        description: `Successfully achieved your goal of ${goal.targetValue} ${goal.unit}`,
        type: 'completion',
        icon: '🎯'
      });
    }

    return updatedGoal;
  }

  /**
   * Create an achievement
   */
  static async createAchievement(userId: string, achievementData: {
    title: string;
    description: string;
    type: string;
    icon?: string;
    metadata?: any;
  }): Promise<any> {
    return await prisma.achievement.create({
      data: {
        userId,
        title: achievementData.title,
        description: achievementData.description,
        type: achievementData.type,
        icon: achievementData.icon,
        metadata: achievementData.metadata ? JSON.stringify(achievementData.metadata) : null
      }
    });
  }

  /**
   * Get user's achievements
   */
  static async getAchievements(userId: string): Promise<any[]> {
    return await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    });
  }

  /**
   * Create motivational feedback
   */
  static async createMotivationalFeedback(userId: string, feedback: MotivationalMessage): Promise<any> {
    return await prisma.motivationalFeedback.create({
      data: {
        userId,
        type: feedback.type,
        title: feedback.title,
        message: feedback.message,
        priority: feedback.priority
      }
    });
  }

  /**
   * Get unread motivational feedback
   */
  static async getUnreadMotivationalFeedback(userId: string): Promise<any[]> {
    return await prisma.motivationalFeedback.findMany({
      where: {
        userId,
        isRead: false
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Mark motivational feedback as read
   */
  static async markFeedbackAsRead(feedbackId: string): Promise<any> {
    return await prisma.motivationalFeedback.update({
      where: { id: feedbackId },
      data: { isRead: true }
    });
  }

  /**
   * Calculate comprehensive progress statistics
   */
  static async getProgressStats(userId: string): Promise<ProgressStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    });

    const goals = await prisma.goal.findMany({
      where: { userId }
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId }
    });

    // Calculate totals
    const totalCodingHours = dailyLogs.reduce((sum, log) => sum + log.codingMinutes, 0) / 60;
    const totalApplications = dailyLogs.reduce((sum, log) => sum + log.applicationsSubmitted, 0);
    const totalLearningHours = dailyLogs.reduce((sum, log) => sum + log.learningMinutes, 0) / 60;

    // Calculate averages
    const daysWithData = dailyLogs.length || 1;
    const averageDailyCoding = totalCodingHours / daysWithData;
    const averageDailyApplications = totalApplications / daysWithData;
    const averageDailyLearning = totalLearningHours / daysWithData;

    // Calculate streak
    const currentStreak = this.calculateCurrentStreak(dailyLogs);
    const longestStreak = this.calculateLongestStreak(dailyLogs);

    // Calculate trends
    const moodTrend = this.calculateMoodTrend(dailyLogs);
    const productivityTrend = this.calculateProductivityTrend(dailyLogs);

    return {
      totalCodingHours: Math.round(totalCodingHours * 100) / 100,
      totalApplications,
      totalLearningHours: Math.round(totalLearningHours * 100) / 100,
      averageDailyCoding: Math.round(averageDailyCoding * 100) / 100,
      averageDailyApplications: Math.round(averageDailyApplications * 100) / 100,
      averageDailyLearning: Math.round(averageDailyLearning * 100) / 100,
      currentStreak,
      longestStreak,
      goalsCompleted: goals.filter(g => g.status === 'COMPLETED').length,
      goalsActive: goals.filter(g => g.status === 'ACTIVE').length,
      achievementsUnlocked: achievements.length,
      moodTrend,
      productivityTrend
    };
  }

  /**
   * Generate strategic guidance based on user's job search deadline
   */
  static async generateStrategicGuidance(userId: string): Promise<MotivationalMessage[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.jobSearchDeadline) {
      return [];
    }

    const now = new Date();
    const deadline = new Date(user.jobSearchDeadline);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const stats = await this.getProgressStats(userId);
    const activeGoals = await this.getActiveGoals(userId);
    const recentLogs = await this.getDailyLogs(userId, 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    const guidance: MotivationalMessage[] = [];

    // Deadline urgency guidance
    if (daysUntilDeadline <= 30) {
      guidance.push({
        type: 'warning',
        title: 'Final Push Required',
        message: `You have ${daysUntilDeadline} days until your job search deadline. Focus on completing high-impact projects and increasing application volume.`,
        priority: 'HIGH'
      });
    } else if (daysUntilDeadline <= 60) {
      guidance.push({
        type: 'guidance',
        title: 'Midpoint Check',
        message: `You're halfway through your timeline. Review your progress and adjust your strategy if needed.`,
        priority: 'MEDIUM'
      });
    }

    // Progress-based guidance
    if (stats.averageDailyApplications < 2) {
      guidance.push({
        type: 'guidance',
        title: 'Increase Application Rate',
        message: 'Try to submit at least 2-3 applications daily to maximize your chances.',
        priority: 'MEDIUM'
      });
    }

    if (stats.averageDailyCoding < 2) {
      guidance.push({
        type: 'guidance',
        title: 'Boost Coding Time',
        message: 'Aim for at least 2 hours of coding daily to build your portfolio effectively.',
        priority: 'MEDIUM'
      });
    }

    // Streak encouragement
    if (stats.currentStreak >= 7) {
      guidance.push({
        type: 'celebration',
        title: 'Amazing Consistency!',
        message: `You've maintained a ${stats.currentStreak}-day streak! Keep up the excellent work.`,
        priority: 'LOW'
      });
    }

    // Goal completion encouragement
    if (stats.goalsCompleted > 0) {
      guidance.push({
        type: 'celebration',
        title: 'Goal Achievement',
        message: `Congratulations! You've completed ${stats.goalsCompleted} goals.`,
        priority: 'LOW'
      });
    }

    return guidance;
  }

  /**
   * Calculate current streak
   */
  private static calculateCurrentStreak(dailyLogs: any[]): number {
    if (dailyLogs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    while (true) {
      const logForDate = dailyLogs.find(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === currentDate.getTime();
      });

      if (logForDate && (logForDate.codingMinutes > 0 || logForDate.applicationsSubmitted > 0 || logForDate.learningMinutes > 0)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak
   */
  private static calculateLongestStreak(dailyLogs: any[]): number {
    if (dailyLogs.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;

    for (const log of dailyLogs) {
      if (log.codingMinutes > 0 || log.applicationsSubmitted > 0 || log.learningMinutes > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  /**
   * Calculate mood trend
   */
  private static calculateMoodTrend(dailyLogs: any[]): string {
    const recentLogs = dailyLogs.slice(-7).filter(log => log.mood);
    if (recentLogs.length === 0) return 'stable';

    const moodScores = recentLogs.map(log => {
      switch (log.mood) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'okay': return 2;
        case 'poor': return 1;
        default: return 2;
      }
    });

    const averageScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    
    if (averageScore > 3.5) return 'improving';
    if (averageScore < 2.5) return 'declining';
    return 'stable';
  }

  /**
   * Calculate productivity trend
   */
  private static calculateProductivityTrend(dailyLogs: any[]): string {
    const recentLogs = dailyLogs.slice(-7).filter(log => log.productivity);
    if (recentLogs.length === 0) return 'stable';

    const productivityScores = recentLogs.map(log => log.productivity || 5);
    const averageScore = productivityScores.reduce((sum, score) => sum + score, 0) / productivityScores.length;
    
    if (averageScore > 7) return 'improving';
    if (averageScore < 4) return 'declining';
    return 'stable';
  }
} 