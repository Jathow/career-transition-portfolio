import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface JobApplication {
  id: string;
  userId: string;
  resumeId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  applicationDate: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  coverLetter?: string;
  notes?: string;
  followUpDate?: string;
  companyResearch?: string;
  preparationNotes?: string;
  createdAt: string;
  updatedAt: string;
  resume?: {
    id: string;
    versionName: string;
  };
  interviews?: Array<{
    id: string;
    interviewType: string;
    scheduledDate: string;
    outcome: string;
  }>;
}

export interface CreateJobApplicationData {
  resumeId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: string;
  companyResearch?: string;
  preparationNotes?: string;
}

export interface UpdateJobApplicationData {
  companyName?: string;
  jobTitle?: string;
  jobUrl?: string;
  status?: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: string;
  companyResearch?: string;
  preparationNotes?: string;
}

export interface JobApplicationFilters {
  status?: string;
  companyName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApplicationAnalytics {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByMonth: Record<string, number>;
  averageTimeToResponse: number;
  successRate: number;
  topCompanies: Array<{ companyName: string; count: number }>;
}

interface JobApplicationState {
  applications: JobApplication[];
  currentApplication: JobApplication | null;
  analytics: ApplicationAnalytics | null;
  applicationsNeedingFollowUp: JobApplication[];
  loading: boolean;
  error: string | null;
  filters: JobApplicationFilters;
  searchTerm: string;
}

const initialState: JobApplicationState = {
  applications: [],
  currentApplication: null,
  analytics: null,
  applicationsNeedingFollowUp: [],
  loading: false,
  error: null,
  filters: {},
  searchTerm: ''
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  'jobApplications/fetchApplications',
  async (filters?: JobApplicationFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.companyName) params.append('companyName', filters.companyName);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get(`/applications?${params.toString()}`);
    return response.data.data;
  }
);

export const searchApplications = createAsyncThunk(
  'jobApplications/searchApplications',
  async (searchTerm: string) => {
    const response = await api.get(`/applications?search=${encodeURIComponent(searchTerm)}`);
    return response.data.data;
  }
);

export const createApplication = createAsyncThunk(
  'jobApplications/createApplication',
  async (applicationData: CreateJobApplicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data.data;
  }
);

export const updateApplication = createAsyncThunk(
  'jobApplications/updateApplication',
  async ({ id, data }: { id: string; data: UpdateJobApplicationData }) => {
    const response = await api.put(`/applications/${id}`, data);
    return response.data.data;
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'jobApplications/updateApplicationStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data.data;
  }
);

export const addApplicationNotes = createAsyncThunk(
  'jobApplications/addApplicationNotes',
  async ({ id, notes }: { id: string; notes: string }) => {
    const response = await api.post(`/applications/${id}/notes`, { notes });
    return response.data.data;
  }
);

export const deleteApplication = createAsyncThunk(
  'jobApplications/deleteApplication',
  async (id: string) => {
    await api.delete(`/applications/${id}`);
    return id;
  }
);

export const fetchApplicationAnalytics = createAsyncThunk(
  'jobApplications/fetchApplicationAnalytics',
  async () => {
    const response = await api.get('/applications/analytics');
    return response.data.data;
  }
);

export const fetchApplicationsNeedingFollowUp = createAsyncThunk(
  'jobApplications/fetchApplicationsNeedingFollowUp',
  async () => {
    const response = await api.get('/applications/follow-up');
    return response.data.data;
  }
);

export const fetchApplicationById = createAsyncThunk(
  'jobApplications/fetchApplicationById',
  async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data.data;
  }
);

const jobApplicationSlice = createSlice({
  name: 'jobApplications',
  initialState,
  reducers: {
    setCurrentApplication: (state, action: PayloadAction<JobApplication | null>) => {
      state.currentApplication = action.payload;
    },
    setFilters: (state, action: PayloadAction<JobApplicationFilters>) => {
      state.filters = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    // Optimistic reducers
    optimisticUpdateStatus: (state, action: PayloadAction<{ id: string; status: string; previous?: JobApplication }>) => {
      const index = state.applications.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = { ...state.applications[index], status: action.payload.status as any };
      }
      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = { ...state.currentApplication, status: action.payload.status as any } as JobApplication;
      }
    },
    optimisticDelete: (state, action: PayloadAction<{ id: string; previous?: JobApplication }>) => {
      state.applications = state.applications.filter(a => a.id !== action.payload.id);
      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = null;
      }
    },
    optimisticSaveNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const index = state.applications.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = { ...state.applications[index], notes: action.payload.notes };
      }
      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = { ...state.currentApplication, notes: action.payload.notes } as JobApplication;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch applications';
      })
      
      // Search applications
      .addCase(searchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(searchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search applications';
      })
      
      // Create application
      .addCase(createApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.unshift(action.payload);
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create application';
      })
      
      // Update application
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload;
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update application';
      })
      
      // Update application status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update application status';
      })
      
      // Add application notes
      .addCase(addApplicationNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addApplicationNotes.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload;
        }
      })
      .addCase(addApplicationNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add notes';
      })
      
      // Delete application
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = state.applications.filter(app => app.id !== action.payload);
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete application';
      })
      
      // Fetch analytics
      .addCase(fetchApplicationAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchApplicationAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      
      // Fetch applications needing follow-up
      .addCase(fetchApplicationsNeedingFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsNeedingFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationsNeedingFollowUp = action.payload;
      })
      .addCase(fetchApplicationsNeedingFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch applications needing follow-up';
      })
      
      // Fetch application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch application';
      });
  }
});

export const {
  setCurrentApplication,
  setFilters,
  setSearchTerm,
  clearError,
  clearCurrentApplication
} = jobApplicationSlice.actions;

export default jobApplicationSlice.reducer; 