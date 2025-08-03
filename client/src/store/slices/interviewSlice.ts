import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Interview {
  id: string;
  applicationId: string;
  interviewType: string;
  scheduledDate: string;
  duration: number;
  interviewerName?: string;
  preparationNotes?: string;
  questionsAsked: string;
  feedback?: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    companyName: string;
    jobTitle: string;
  };
}

export interface InterviewStats {
  total: number;
  upcoming: number;
  completed: number;
  passed: number;
  failed: number;
  cancelled: number;
  averageDuration: number;
}

export interface PreparationMaterials {
  companyInfo: string;
  commonQuestions: string[];
  technicalTopics: string[];
  behavioralQuestions: string[];
}

interface InterviewState {
  interviews: Interview[];
  selectedInterview: Interview | null;
  stats: InterviewStats | null;
  preparationMaterials: PreparationMaterials | null;
  loading: boolean;
  error: string | null;
  filters: {
    applicationId?: string;
    interviewType?: string;
    outcome?: string;
    scheduledDateFrom?: string;
    scheduledDateTo?: string;
  };
}

const initialState: InterviewState = {
  interviews: [],
  selectedInterview: null,
  stats: null,
  preparationMaterials: null,
  loading: false,
  error: null,
  filters: {}
};

// Async thunks
export const fetchInterviews = createAsyncThunk(
  'interviews/fetchInterviews',
  async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    
    const response = await api.get(`/interviews?${params.toString()}`);
    return response.data.data;
  }
);

export const fetchInterviewById = createAsyncThunk(
  'interviews/fetchInterviewById',
  async (interviewId: string) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data.data;
  }
);

export const createInterview = createAsyncThunk(
  'interviews/createInterview',
  async (interviewData: any) => {
    const response = await api.post('/interviews', interviewData);
    return response.data.data;
  }
);

export const updateInterview = createAsyncThunk(
  'interviews/updateInterview',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/interviews/${id}`, data);
    return response.data.data;
  }
);

export const deleteInterview = createAsyncThunk(
  'interviews/deleteInterview',
  async (interviewId: string) => {
    await api.delete(`/interviews/${interviewId}`);
    return interviewId;
  }
);

export const addInterviewFeedback = createAsyncThunk(
  'interviews/addInterviewFeedback',
  async ({ id, feedback }: { id: string; feedback: string }) => {
    const response = await api.post(`/interviews/${id}/feedback`, { feedback });
    return response.data.data;
  }
);

export const addInterviewQuestions = createAsyncThunk(
  'interviews/addInterviewQuestions',
  async ({ id, questions }: { id: string; questions: string }) => {
    const response = await api.post(`/interviews/${id}/questions`, { questions });
    return response.data.data;
  }
);

export const updateInterviewOutcome = createAsyncThunk(
  'interviews/updateInterviewOutcome',
  async ({ id, outcome }: { id: string; outcome: string }) => {
    const response = await api.put(`/interviews/${id}/outcome`, { outcome });
    return response.data.data;
  }
);

export const fetchInterviewStats = createAsyncThunk(
  'interviews/fetchInterviewStats',
  async () => {
    const response = await api.get('/interviews/stats');
    return response.data.data;
  }
);

export const fetchPreparationMaterials = createAsyncThunk(
  'interviews/fetchPreparationMaterials',
  async (companyName: string) => {
    const response = await api.get(`/interviews/preparation/${encodeURIComponent(companyName)}`);
    return response.data.data;
  }
);

export const fetchUpcomingInterviews = createAsyncThunk(
  'interviews/fetchUpcomingInterviews',
  async () => {
    const response = await api.get('/interviews/upcoming');
    return response.data.data;
  }
);

const interviewSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    setSelectedInterview: (state, action: PayloadAction<Interview | null>) => {
      state.selectedInterview = action.payload;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPreparationMaterials: (state) => {
      state.preparationMaterials = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch interviews
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch interviews';
      });

    // Fetch interview by ID
    builder
      .addCase(fetchInterviewById.fulfilled, (state, action) => {
        state.selectedInterview = action.payload;
      })
      .addCase(fetchInterviewById.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch interview';
      });

    // Create interview
    builder
      .addCase(createInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews.unshift(action.payload);
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create interview';
      });

    // Update interview
    builder
      .addCase(updateInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.interviews[index] = action.payload;
        }
        if (state.selectedInterview?.id === action.payload.id) {
          state.selectedInterview = action.payload;
        }
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update interview';
      });

    // Delete interview
    builder
      .addCase(deleteInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = state.interviews.filter(i => i.id !== action.payload);
        if (state.selectedInterview?.id === action.payload) {
          state.selectedInterview = null;
        }
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete interview';
      });

    // Add feedback
    builder
      .addCase(addInterviewFeedback.fulfilled, (state, action) => {
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.interviews[index] = action.payload;
        }
        if (state.selectedInterview?.id === action.payload.id) {
          state.selectedInterview = action.payload;
        }
      });

    // Add questions
    builder
      .addCase(addInterviewQuestions.fulfilled, (state, action) => {
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.interviews[index] = action.payload;
        }
        if (state.selectedInterview?.id === action.payload.id) {
          state.selectedInterview = action.payload;
        }
      });

    // Update outcome
    builder
      .addCase(updateInterviewOutcome.fulfilled, (state, action) => {
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.interviews[index] = action.payload;
        }
        if (state.selectedInterview?.id === action.payload.id) {
          state.selectedInterview = action.payload;
        }
      });

    // Fetch stats
    builder
      .addCase(fetchInterviewStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchInterviewStats.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch interview statistics';
      });

    // Fetch preparation materials
    builder
      .addCase(fetchPreparationMaterials.fulfilled, (state, action) => {
        state.preparationMaterials = action.payload;
      })
      .addCase(fetchPreparationMaterials.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch preparation materials';
      });

    // Fetch upcoming interviews
    builder
      .addCase(fetchUpcomingInterviews.fulfilled, (state, action) => {
        // This could be used to update a separate upcoming interviews list
        // For now, we'll just update the main interviews list
        state.interviews = action.payload;
      });
  }
});

export const {
  setSelectedInterview,
  setFilters,
  clearFilters,
  clearError,
  clearPreparationMaterials
} = interviewSlice.actions;

export default interviewSlice.reducer; 