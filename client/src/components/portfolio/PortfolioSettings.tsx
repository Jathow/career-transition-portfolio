import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
} from '@mui/material';
import { Save, Edit, Cancel } from '@mui/icons-material';
import { Portfolio } from '../../store/slices/portfolioSlice';

interface PortfolioSettingsProps {
  portfolio: Portfolio | null;
  portfolioData: Partial<Portfolio>;
  setPortfolioData: (data: Partial<Portfolio>) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  onUpdateSEO: (seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }) => void;
  loading: boolean;
}

const PortfolioSettings: React.FC<PortfolioSettingsProps> = ({
  portfolio,
  portfolioData,
  setPortfolioData,
  isEditing,
  setIsEditing,
  onSave,
  onUpdateSEO,
  loading,
}) => {
  const [seoData, setSeoData] = useState({
    seoTitle: portfolio?.seoTitle || '',
    seoDescription: portfolio?.seoDescription || '',
    seoKeywords: portfolio?.seoKeywords || '',
  });

  const themes = [
    { value: 'default', label: 'Default' },
    { value: 'dark', label: 'Dark' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'professional', label: 'Professional' },
  ];

  const handleSave = () => {
    onSave();
    onUpdateSEO(seoData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (portfolio) {
      setPortfolioData(portfolio);
      setSeoData({
        seoTitle: portfolio.seoTitle || '',
        seoDescription: portfolio.seoDescription || '',
        seoKeywords: portfolio.seoKeywords || '',
      });
    }
  };

  if (!portfolio && !isEditing) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first portfolio to get started.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsEditing(true)}
            startIcon={<Edit />}
          >
            Create Portfolio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Basic Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Basic Settings</Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsEditing(true)}
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Portfolio Title"
                  value={portfolioData.title || ''}
                  onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subtitle"
                  value={portfolioData.subtitle || ''}
                  onChange={(e) => setPortfolioData({ ...portfolioData, subtitle: e.target.value })}
                  disabled={!isEditing}
                  helperText="Optional subtitle for your portfolio"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={portfolioData.description || ''}
                  onChange={(e) => setPortfolioData({ ...portfolioData, description: e.target.value })}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                  helperText="Brief description of your portfolio"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={portfolioData.theme || 'default'}
                    onChange={(e) => setPortfolioData({ ...portfolioData, theme: e.target.value })}
                    label="Theme"
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Domain"
                  value={portfolioData.customDomain || ''}
                  onChange={(e) => setPortfolioData({ ...portfolioData, customDomain: e.target.value })}
                  disabled={!isEditing}
                  helperText="Optional custom domain (e.g., portfolio.yourdomain.com)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* SEO Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SEO Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Optimize your portfolio for search engines
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SEO Title"
                  value={seoData.seoTitle}
                  onChange={(e) => setSeoData({ ...seoData, seoTitle: e.target.value })}
                  disabled={!isEditing}
                  helperText="Title that appears in search results"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SEO Description"
                  value={seoData.seoDescription}
                  onChange={(e) => setSeoData({ ...seoData, seoDescription: e.target.value })}
                  disabled={!isEditing}
                  multiline
                  rows={2}
                  helperText="Description that appears in search results"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SEO Keywords"
                  value={seoData.seoKeywords}
                  onChange={(e) => setSeoData({ ...seoData, seoKeywords: e.target.value })}
                  disabled={!isEditing}
                  helperText="Comma-separated keywords for SEO"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Visibility & Analytics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Visibility & Analytics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Portfolio Visibility
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Control who can view your portfolio
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={portfolio?.isPublic ? 'Public' : 'Private'}
                      color={portfolio?.isPublic ? 'success' : 'warning'}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {portfolio?.isPublic
                        ? 'Anyone with the link can view your portfolio'
                        : 'Only you can view your portfolio'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Track visitor engagement and portfolio performance
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={portfolioData.analyticsEnabled ?? true}
                        onChange={(e) => setPortfolioData({ ...portfolioData, analyticsEnabled: e.target.checked })}
                        disabled={!isEditing}
                      />
                    }
                    label="Enable Analytics"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {portfolioData.analyticsEnabled
                      ? 'Analytics are enabled. Track views, visitors, and engagement.'
                      : 'Analytics are disabled. No visitor data will be collected.'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Preview */}
      {isEditing && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Preview of how your portfolio will appear to visitors
              </Alert>
              
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="h4" gutterBottom>
                  {portfolioData.title || 'Your Portfolio Title'}
                </Typography>
                {portfolioData.subtitle && (
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {portfolioData.subtitle}
                  </Typography>
                )}
                {portfolioData.description && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {portfolioData.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Theme: ${portfolioData.theme || 'default'}`} size="small" />
                  <Chip
                    label={portfolioData.analyticsEnabled ? 'Analytics: Enabled' : 'Analytics: Disabled'}
                    size="small"
                    color={portfolioData.analyticsEnabled ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default PortfolioSettings; 