import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Analytics,
  Settings,
  Refresh,
  Public,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  fetchUserPortfolio,
  createOrUpdatePortfolio,
  generatePortfolioContent,
  togglePortfolioVisibility,
  updatePortfolioSEO,
  fetchPortfolioAnalytics,
  Portfolio,
} from '../store/slices/portfolioSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PortfolioAnalytics from '../components/portfolio/PortfolioAnalytics';
import PortfolioSettings from '../components/portfolio/PortfolioSettings';
import PortfolioPreview from '../components/portfolio/PortfolioPreview';

const PortfolioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { portfolio, loading, error, analytics } = useAppSelector((state) => state.portfolio);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'analytics' | 'preview'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<Partial<Portfolio>>({});

  useEffect(() => {
    dispatch(fetchUserPortfolio());
  }, [dispatch]);

  useEffect(() => {
    if (portfolio) {
      setPortfolioData(portfolio);
    }
  }, [portfolio]);

  const handleSavePortfolio = async () => {
    if (portfolio) {
      await dispatch(createOrUpdatePortfolio(portfolioData));
      setIsEditing(false);
    } else {
      await dispatch(createOrUpdatePortfolio(portfolioData));
    }
  };

  const handleGenerateContent = async () => {
    await dispatch(generatePortfolioContent({
      includeCompletedProjects: true,
      includeResume: true,
      includeAnalytics: true,
    }));
  };

  const handleToggleVisibility = async () => {
    await dispatch(togglePortfolioVisibility());
  };

  const handleUpdateSEO = async (seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }) => {
    await dispatch(updatePortfolioSEO(seoData));
  };

  const handleFetchAnalytics = async () => {
    await dispatch(fetchPortfolioAnalytics(30));
  };

  const getPublicUrl = () => {
    if (!portfolio || !user) return '';
    return `${window.location.origin}/portfolio/public/${user.id}`;
  };

  if (loading && !portfolio) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Portfolio Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage your professional portfolio showcase
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Portfolio Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Portfolio Status</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {portfolio?.isPublic ? (
                <Chip
                  icon={<Public />}
                  label="Public"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<VisibilityOff />}
                  label="Private"
                  color="warning"
                  variant="outlined"
                />
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleToggleVisibility}
                startIcon={portfolio?.isPublic ? <VisibilityOff /> : <Visibility />}
              >
                {portfolio?.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            </Box>
          </Box>

          {portfolio && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Title: {portfolio.title}
                </Typography>
                {portfolio.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    Subtitle: {portfolio.subtitle}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Theme: {portfolio.theme}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analytics: {portfolio.analyticsEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
                {portfolio.isPublic && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Public URL:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        value={getPublicUrl()}
                        InputProps={{ readOnly: true }}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        size="small"
                        onClick={() => navigator.clipboard.writeText(getPublicUrl())}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          <Grid item>
            <Button
              variant={activeTab === 'overview' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('overview')}
              startIcon={<Analytics />}
            >
              Overview
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={activeTab === 'settings' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('settings')}
              startIcon={<Settings />}
            >
              Settings
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={activeTab === 'analytics' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('analytics')}
              startIcon={<Analytics />}
            >
              Analytics
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={activeTab === 'preview' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('preview')}
              startIcon={<Visibility />}
            >
              Preview
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Quick Actions</Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateContent}
                  startIcon={<Refresh />}
                  disabled={loading}
                >
                  Regenerate Content
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {portfolio?.isPublic ? 'Live' : 'Draft'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analytics?.totalViews || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Views
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analytics?.uniqueVisitors || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unique Visitors
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {portfolio ? (
                  `Last updated: ${new Date(portfolio.updatedAt).toLocaleString()}`
                ) : (
                  'No portfolio created yet. Create your first portfolio to get started.'
                )}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 'settings' && (
        <PortfolioSettings
          portfolio={portfolio}
          portfolioData={portfolioData}
          setPortfolioData={setPortfolioData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={handleSavePortfolio}
          onUpdateSEO={handleUpdateSEO}
          loading={loading}
        />
      )}

      {activeTab === 'analytics' && (
        <PortfolioAnalytics
          analytics={analytics}
          onFetchAnalytics={handleFetchAnalytics}
          loading={loading}
        />
      )}

      {activeTab === 'preview' && (
        <div data-tour="portfolio-preview">
          <PortfolioPreview />
        </div>
      )}
    </Container>
  );
};

export default PortfolioPage; 