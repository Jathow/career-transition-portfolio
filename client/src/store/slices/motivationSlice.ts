import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { motivationAPI } from '../../services/api';

// Types
export interface DailyLog {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  icon?: string;
  unlockedAt: string;
  metadata?: string;
  createdAt: string;
}

export interface MotivationalFeedback {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  expiresAt?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
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

export interface MotivationDashboard {
  stats: ProgressStats;
  activeGoals: Goal[];
  achievements: Achievement[];
  unreadFeedback: MotivationalFeedback[];
  guidance: MotivationalFeedback[];
  recentLogs: DailyLog[];
}

interface MotivationState {
  dailyLogs: DailyLog[];
  goals: Goal[];
  achievements: Achievement[];
  motivationalFeedback: MotivationalFeedback[];
  progressStats: ProgressStats | null;
  dashboard: MotivationDashboard | null;
  loading: boolean;
  error: string | null;
}

const initialState: MotivationState = {
  dailyLogs: [],
  goals: [],
  achievements: [],
  motivationalFeedback: [],
  progressStats: null,
  dashboard: null,
  loading: false,
  error: null,
};

// Async thunks
export const logDailyActivity = createAsyncThunk(
  'motivation/logDailyActivity',
  async (logData: {
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
  }) => {
    const response = await motivationAPI.logDailyActivity(logData);
    return response.data;
  }
);

export const fetchDailyLogs = createAsyncThunk(
  'motivation/fetchDailyLogs',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await motivationAPI.getDailyLogs(startDate, endDate);
    return response.data;
  }
);

export const createGoal = createAsyncThunk(
  'motivation/createGoal',
  async (goalData: {
    title: string;
    description?: string;
    type: 'weekly' | 'monthly' | 'custom';
    targetValue: number;
    unit: string;
    endDate: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => {
    const response = await motivationAPI.createGoal(goalData);
    return response.data;
  }
);

export const fetchActiveGoals = createAsyncThunk(
  'motivation/fetchActiveGoals',
  async () => {
    const response = await motivationAPI.getActiveGoals();
    return response.data;
  }
);

export const updateGoalProgress = createAsyncThunk(
  'motivation/updateGoalProgress',
  async ({ goalId, currentValue }: { goalId: string; currentValue: number }) => {
    const response = await motivationAPI.updateGoalProgress(goalId, currentValue);
    return response.data;
  }
);

export const fetchAchievements = createAsyncThunk(
  'motivation/fetchAchievements',
  async () => {
    const response = await motivationAPI.getAchievements();
    return response.data;
  }
);

export const fetchUnreadFeedback = createAsyncThunk(
  'motivation/fetchUnreadFeedback',
  async () => {
    const response = await motivationAPI.getUnreadFeedback();
    return response.data;
  }
);

export const markFeedbackAsRead = createAsyncThunk(
  'motivation/markFeedbackAsRead',
  async (feedbackId: string) => {
    const response = await motivationAPI.markFeedbackAsRead(feedbackId);
    return response.data;
  }
);

export const fetchProgressStats = createAsyncThunk(
  'motivation/fetchProgressStats',
  async () => {
    const response = await motivationAPI.getProgressStats();
    return response.data;
  }
);

export const fetchStrategicGuidance = createAsyncThunk(
  'motivation/fetchStrategicGuidance',
  async () => {
    const response = await motivationAPI.getStrategicGuidance();
    return response.data;
  }
);

export const fetchMotivationDashboard = createAsyncThunk(
  'motivation/fetchMotivationDashboard',
  async () => {
    const response = await motivationAPI.getMotivationDashboard();
    return response.data;
  }
);

const motivationSlice = createSlice({
  name: 'motivation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMotivationData: (state) => {
      state.dailyLogs = [];
      state.goals = [];
      state.achievements = [];
      state.motivationalFeedback = [];
      state.progressStats = null;
      state.dashboard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Log daily activity
      .addCase(logDailyActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logDailyActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Update or add the daily log
        const logData = action.payload.data || action.payload;
        const index = state.dailyLogs.findIndex(log => log.id === logData.id);
        if (index !== -1) {
          state.dailyLogs[index] = logData;
        } else {
          state.dailyLogs.push(logData);
        }
      })
      .addCase(logDailyActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to log daily activity';
      })

      // Fetch daily logs
      .addCase(fetchDailyLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyLogs = action.payload.data || [];
      })
      .addCase(fetchDailyLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch daily logs';
      })

      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload.data || action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create goal';
      })

      // Fetch active goals
      .addCase(fetchActiveGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload.data || [];
      })
      .addCase(fetchActiveGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch active goals';
      })

      // Update goal progress
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        state.loading = false;
        const goalData = action.payload.data || action.payload;
        const index = state.goals.findIndex(goal => goal.id === goalData.id);
        if (index !== -1) {
          state.goals[index] = goalData;
        }
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update goal progress';
      })

      // Fetch achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload.data || [];
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch achievements';
      })

      // Fetch unread feedback
      .addCase(fetchUnreadFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.motivationalFeedback = action.payload.data || [];
      })
      .addCase(fetchUnreadFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch unread feedback';
      })

      // Mark feedback as read
      .addCase(markFeedbackAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markFeedbackAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const feedbackData = action.payload.data || action.payload;
        const index = state.motivationalFeedback.findIndex(feedback => feedback.id === feedbackData.id);
        if (index !== -1) {
          state.motivationalFeedback[index] = feedbackData;
        }
      })
      .addCase(markFeedbackAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark feedback as read';
      })

      // Fetch progress stats
      .addCase(fetchProgressStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.loading = false;
        state.progressStats = action.payload.data || null;
      })
      .addCase(fetchProgressStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch progress stats';
      })

      // Fetch strategic guidance
      .addCase(fetchStrategicGuidance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStrategicGuidance.fulfilled, (state, action) => {
        state.loading = false;
        // Add guidance to motivational feedback
        const guidanceData = action.payload.data || action.payload;
        state.motivationalFeedback = [...state.motivationalFeedback, ...guidanceData];
      })
      .addCase(fetchStrategicGuidance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch strategic guidance';
      })

      // Fetch motivation dashboard
      .addCase(fetchMotivationDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMotivationDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const dashboardData = action.payload.data || action.payload;
        state.dashboard = dashboardData;
        state.progressStats = dashboardData.stats;
        state.goals = dashboardData.activeGoals;
        state.achievements = dashboardData.achievements;
        state.motivationalFeedback = dashboardData.unreadFeedback;
        state.dailyLogs = dashboardData.recentLogs;
      })
      .addCase(fetchMotivationDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch motivation dashboard';
      });
  },
});

export const { clearError, clearMotivationData } = motivationSlice.actions;
export default motivationSlice.reducer; 