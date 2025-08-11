import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;
  description?: string;
  theme: string;
  customDomain?: string;
  isPublic: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  analyticsEnabled: boolean;
  lastGenerated: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAsset {
  id: string;
  portfolioId: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: Record<string, number>;
  referrers: Record<string, number>;
  recentViews: Array<{
    id: string;
    visitorIp?: string;
    userAgent?: string;
    referrer?: string;
    page: string;
    timestamp: string;
  }>;
}

export interface PortfolioContent {
  user: {
    firstName: string;
    lastName: string;
    targetJobTitle?: string;
    email: string;
  };
  portfolio: {
    title: string;
    subtitle?: string;
    description?: string;
    theme: string;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    techStack: string;
    repositoryUrl?: string;
    liveUrl?: string;
    startDate: string;
    actualEndDate?: string;
    revenueTracking: boolean;
    marketResearch?: string;
  }>;
  resume?: {
    content: any;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  analytics: boolean;
}

interface PortfolioState {
  portfolio: Portfolio | null;
  assets: PortfolioAsset[];
  analytics: PortfolioAnalytics | null;
  content: PortfolioContent | null;
  loading: boolean;
  error: string | null;
  publicPortfolio: Portfolio | null;
  publicContent: PortfolioContent | null;
}

const initialState: PortfolioState = {
  portfolio: null,
  assets: [],
  analytics: null,
  content: null,
  loading: false,
  error: null,
  publicPortfolio: null,
  publicContent: null,
};

// Async thunks
export const fetchUserPortfolio = createAsyncThunk(
  'portfolio/fetchUserPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolio');
    }
  }
);

export const createOrUpdatePortfolio = createAsyncThunk(
  'portfolio/createOrUpdatePortfolio',
  async (portfolioData: Partial<Portfolio>, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio', portfolioData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create/update portfolio');
    }
  }
);

export const generatePortfolioContent = createAsyncThunk(
  'portfolio/generatePortfolioContent',
  async (options: {
    includeCompletedProjects?: boolean;
    includeResume?: boolean;
    includeAnalytics?: boolean;
    theme?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/generate', options);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to generate portfolio content');
    }
  }
);

export const fetchPortfolioAssets = createAsyncThunk(
  'portfolio/fetchPortfolioAssets',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/assets/${portfolioId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolio assets');
    }
  }
);

export const addPortfolioAsset = createAsyncThunk(
  'portfolio/addPortfolioAsset',
  async (assetData: Partial<PortfolioAsset>, { rejectWithValue }) => {
    try {
      const response = await api.post('/portfolio/assets', assetData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add portfolio asset');
    }
  }
);

export const deletePortfolioAsset = createAsyncThunk(
  'portfolio/deletePortfolioAsset',
  async (assetId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/portfolio/assets/${assetId}`);
      return assetId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete portfolio asset');
    }
  }
);

export const fetchPortfolioAnalytics = createAsyncThunk(
  'portfolio/fetchPortfolioAnalytics',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/analytics?days=${days}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch portfolio analytics');
    }
  }
);

export const updatePortfolioSEO = createAsyncThunk(
  'portfolio/updatePortfolioSEO',
  async (seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put('/portfolio/seo', seoData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update portfolio SEO');
    }
  }
);

export const togglePortfolioVisibility = createAsyncThunk(
  'portfolio/togglePortfolioVisibility',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/portfolio/visibility');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to toggle portfolio visibility');
    }
  }
);

export const fetchPublicPortfolio = createAsyncThunk(
  'portfolio/fetchPublicPortfolio',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/public/${userId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch public portfolio');
    }
  }
);

export const fetchPublicPortfolioContent = createAsyncThunk(
  'portfolio/fetchPublicPortfolioContent',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/public/${userId}/content`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch public portfolio content');
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolio: (state) => {
      state.portfolio = null;
      state.assets = [];
      state.analytics = null;
      state.content = null;
      state.error = null;
    },
    clearPublicPortfolio: (state) => {
      state.publicPortfolio = null;
      state.publicContent = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user portfolio
    builder
      .addCase(fetchUserPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create or update portfolio
    builder
      .addCase(createOrUpdatePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(createOrUpdatePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Generate portfolio content
    builder
      .addCase(generatePortfolioContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePortfolioContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(generatePortfolioContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch portfolio assets
    builder
      .addCase(fetchPortfolioAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(fetchPortfolioAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add portfolio asset
    builder
      .addCase(addPortfolioAsset.fulfilled, (state, action) => {
        state.assets.push(action.payload);
      })
      .addCase(addPortfolioAsset.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete portfolio asset
    builder
      .addCase(deletePortfolioAsset.fulfilled, (state, action) => {
        state.assets = state.assets.filter(asset => asset.id !== action.payload);
      })
      .addCase(deletePortfolioAsset.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch portfolio analytics
    builder
      .addCase(fetchPortfolioAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchPortfolioAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update portfolio SEO
    builder
      .addCase(updatePortfolioSEO.fulfilled, (state, action) => {
        state.portfolio = action.payload;
      })
      .addCase(updatePortfolioSEO.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Toggle portfolio visibility
    builder
      .addCase(togglePortfolioVisibility.fulfilled, (state, action) => {
        state.portfolio = action.payload;
      })
      .addCase(togglePortfolioVisibility.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch public portfolio
    builder
      .addCase(fetchPublicPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.publicPortfolio = action.payload;
      })
      .addCase(fetchPublicPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch public portfolio content
      .addCase(fetchPublicPortfolioContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPortfolioContent.fulfilled, (state, action) => {
        state.loading = false;
        state.publicContent = action.payload;
      })
      .addCase(fetchPublicPortfolioContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPortfolio, clearPublicPortfolio, setError, clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer; 