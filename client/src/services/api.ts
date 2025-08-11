import axios from 'axios';

// In production, use relative URLs so it works with any domain
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      // and if the error is not from an auth-related endpoint
      const currentPath = window.location.pathname;
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isLoginPage = currentPath === '/login' || currentPath === '/register';
      // Allow unauthenticated access to explicitly public routes (no redirect)
      const isPublicRoute =
        currentPath.startsWith('/portfolio/public') ||
        currentPath === '/' ||
        currentPath.startsWith('/pricing');
      
      if (!isLoginPage && !isAuthEndpoint && !isPublicRoute) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    targetJobTitle?: string;
    jobSearchDeadline?: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
};

// Project API endpoints
export const projectAPI = {
  createProject: (projectData: {
    title: string;
    description: string;
    techStack: string[];
    startDate?: string;
    targetEndDate: string;
    status?: string;
    repositoryUrl?: string;
    liveUrl?: string;
    revenueTracking?: boolean;
    marketResearch?: string;
  }) => api.post('/projects', projectData),

  getProjects: () => api.get('/projects'),

  getProject: (id: string) => api.get(`/projects/${id}`),

  updateProject: (id: string, projectData: any) => 
    api.put(`/projects/${id}`, projectData),

  deleteProject: (id: string) => api.delete(`/projects/${id}`),

  completeProject: (id: string) => api.post(`/projects/${id}/complete`),

  updateProjectStatus: (id: string, status: string) => 
    api.patch(`/projects/${id}/status`, { status }),
};

// Notification API endpoints
export const notificationAPI = {
  getNotifications: (params?: { unreadOnly?: boolean; limit?: number; offset?: number }) =>
    api.get('/notifications', { params }),

  getNotificationStats: () => api.get('/notifications/stats'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  sendTestNotification: () => api.post('/notifications/test'),

  getPreferences: () => api.get('/notifications/preferences'),

  updatePreferences: (preferences: any) => api.put('/notifications/preferences', preferences),
};

// Time Tracking API endpoints
export const timeTrackingAPI = {
  getProjectProgress: (projectId: string) => 
    api.get(`/time-tracking/projects/${projectId}/progress`),

  getAllProjectsProgress: () => api.get('/time-tracking/projects/progress'),

  getDeadlines: () => api.get('/time-tracking/deadlines'),

  getTimeline: () => api.get('/time-tracking/timeline'),

  getStats: () => api.get('/time-tracking/stats'),

  updateProjectStatuses: () => api.post('/time-tracking/update-statuses'),
};

// Motivation API endpoints
export const motivationAPI = {
  logDailyActivity: (logData: {
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
  }) => api.post('/motivation/daily-log', logData),

  getDailyLogs: (startDate: string, endDate: string) => 
    api.get('/motivation/daily-logs', { params: { startDate, endDate } }),

  createGoal: (goalData: {
    title: string;
    description?: string;
    type: 'weekly' | 'monthly' | 'custom';
    targetValue: number;
    unit: string;
    endDate: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => api.post('/motivation/goals', goalData),

  getActiveGoals: () => api.get('/motivation/goals'),

  getGoal: (goalId: string) => api.get(`/motivation/goals/${goalId}`),

  updateGoalProgress: (goalId: string, currentValue: number) => 
    api.put(`/motivation/goals/${goalId}/progress`, { currentValue }),

  deleteGoal: (goalId: string) => api.delete(`/motivation/goals/${goalId}`),

  getAchievements: () => api.get('/motivation/achievements'),

  createCustomAchievement: (achievementData: {
    title: string;
    description: string;
    type: string;
    icon?: string;
    metadata?: any;
  }) => api.post('/motivation/achievements', achievementData),

  getUnreadFeedback: () => api.get('/motivation/feedback'),

  markFeedbackAsRead: (feedbackId: string) => 
    api.patch(`/motivation/feedback/${feedbackId}/read`),

  getProgressStats: () => api.get('/motivation/stats'),

  getStrategicGuidance: () => api.get('/motivation/guidance'),

  getMotivationDashboard: () => api.get('/motivation/dashboard'),
};

// Resume API endpoints
export const resumeAPI = {
  getTemplates: () => api.get('/resumes/templates'),

  getTemplatesByCategory: (category: string) => api.get(`/resumes/templates/category/${category}`),

  getTemplate: (templateId: string) => api.get(`/resumes/templates/${templateId}`),

  createResume: (resumeData: {
    versionName: string;
    templateId: string;
    content: any;
    isDefault?: boolean;
  }) => api.post('/resumes', resumeData),

  getResumes: () => api.get('/resumes'),

  getResume: (id: string) => api.get(`/resumes/${id}`),

  updateResume: (id: string, resumeData: any) => api.put(`/resumes/${id}`, resumeData),

  deleteResume: (id: string) => api.delete(`/resumes/${id}`),

  setDefaultResume: (id: string) => api.post(`/resumes/${id}/default`),

  getDefaultResume: () => api.get('/resumes/default'),

  generateResumeContent: () => api.get('/resumes/generate/content'),
  // Export removed
};

// Preferences API endpoints
export const preferencesAPI = {
  getPreferences: () => api.get('/preferences'),
  updatePreferences: (preferences: any) => api.put('/preferences', preferences),
};

// Analytics (privacy-friendly)
export const analyticsAPI = {
  ingest: (eventName: string, path: string) => api.post('/analytics/ingest', { eventName, path }),
};

// Feature flags
export const flagsAPI = {
  getFlags: () => api.get('/flags'),
};

// Templates API endpoints
// Template import/export routes removed

// Export both default and named export for flexibility
export { api };
export default api;