import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resumeAPI } from '../../services/api';

export interface ResumeContent {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string[];
    technologies: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    repositoryUrl?: string;
    liveUrl?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'technical' | 'executive';
  preview: string;
}

export interface Resume {
  id: string;
  userId: string;
  versionName: string;
  templateId: string;
  content: string; // JSON string
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResumeData {
  versionName: string;
  templateId: string;
  content: ResumeContent;
  isDefault?: boolean;
}

export interface UpdateResumeData {
  versionName?: string;
  templateId?: string;
  content?: ResumeContent;
  isDefault?: boolean;
}

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  templates: ResumeTemplate[];
  generatedContent: ResumeContent | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  currentResume: null,
  templates: [],
  generatedContent: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'resumes/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.getTemplates();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates');
    }
  }
);

export const fetchTemplatesByCategory = createAsyncThunk(
  'resumes/fetchTemplatesByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.getTemplatesByCategory(category);
      return { category, templates: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates by category');
    }
  }
);

export const createResume = createAsyncThunk(
  'resumes/create',
  async (resumeData: CreateResumeData, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.createResume(resumeData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create resume');
    }
  }
);

export const fetchResumes = createAsyncThunk(
  'resumes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.getResumes();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch resumes');
    }
  }
);

export const fetchResume = createAsyncThunk(
  'resumes/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.getResume(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch resume');
    }
  }
);

export const updateResume = createAsyncThunk(
  'resumes/update',
  async ({ id, data }: { id: string; data: UpdateResumeData }, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.updateResume(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update resume');
    }
  }
);

export const deleteResume = createAsyncThunk(
  'resumes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await resumeAPI.deleteResume(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete resume');
    }
  }
);

export const setDefaultResume = createAsyncThunk(
  'resumes/setDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.setDefaultResume(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to set default resume');
    }
  }
);

export const fetchDefaultResume = createAsyncThunk(
  'resumes/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.getDefaultResume();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch default resume');
    }
  }
);

export const generateResumeContent = createAsyncThunk(
  'resumes/generateContent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.generateResumeContent();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate resume content');
    }
  }
);

export const exportResume = createAsyncThunk(
  'resumes/export',
  async ({ id, format }: { id: string; format: 'pdf' | 'docx' | 'txt' }, { rejectWithValue }) => {
    try {
      const response = await resumeAPI.exportResume(id, format);
      return { id, format, content: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export resume');
    }
  }
);

const resumeSlice = createSlice({
  name: 'resumes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentResume: (state) => {
      state.currentResume = null;
    },
    clearGeneratedContent: (state) => {
      state.generatedContent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create resume
      .addCase(createResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResume.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes.unshift(action.payload);
        if (action.payload.isDefault) {
          // Update other resumes to not be default
          state.resumes.forEach(resume => {
            if (resume.id !== action.payload.id) {
              resume.isDefault = false;
            }
          });
        }
      })
      .addCase(createResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch resumes
      .addCase(fetchResumes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = action.payload;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single resume
      .addCase(fetchResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResume = action.payload;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update resume
      .addCase(updateResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.resumes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resumes[index] = action.payload;
        }
        if (state.currentResume?.id === action.payload.id) {
          state.currentResume = action.payload;
        }
        if (action.payload.isDefault) {
          // Update other resumes to not be default
          state.resumes.forEach(resume => {
            if (resume.id !== action.payload.id) {
              resume.isDefault = false;
            }
          });
        }
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete resume
      .addCase(deleteResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = state.resumes.filter(r => r.id !== action.payload);
        if (state.currentResume?.id === action.payload) {
          state.currentResume = null;
        }
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Set default resume
      .addCase(setDefaultResume.fulfilled, (state, action) => {
        // Update all resumes to not be default
        state.resumes.forEach(resume => {
          resume.isDefault = false;
        });
        
        // Set the specified resume as default
        const index = state.resumes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resumes[index] = action.payload;
        }
        if (state.currentResume?.id === action.payload.id) {
          state.currentResume = action.payload;
        }
      })
      
      // Fetch default resume
      .addCase(fetchDefaultResume.fulfilled, (state, action) => {
        state.currentResume = action.payload;
      })
      
      // Generate resume content
      .addCase(generateResumeContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateResumeContent.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedContent = action.payload;
      })
      .addCase(generateResumeContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentResume, clearGeneratedContent } = resumeSlice.actions;
export default resumeSlice.reducer; 