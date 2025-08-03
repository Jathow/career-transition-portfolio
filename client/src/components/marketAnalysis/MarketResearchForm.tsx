import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { api } from '../../services/api';

interface MarketResearchFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const MarketResearchForm: React.FC<MarketResearchFormProps> = ({
  projectId,
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    researchType: 'market_analysis',
    title: '',
    description: '',
    targetMarket: '',
    marketSize: 'medium',
    competitionLevel: 'medium',
    entryBarriers: '',
    monetizationPotential: 'medium',
    insights: '',
    recommendations: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        researchType: initialData.researchType || 'market_analysis',
        title: initialData.title || '',
        description: initialData.description || '',
        targetMarket: initialData.targetMarket || '',
        marketSize: initialData.marketSize || 'medium',
        competitionLevel: initialData.competitionLevel || 'medium',
        entryBarriers: initialData.entryBarriers || '',
        monetizationPotential: initialData.monetizationPotential || 'medium',
        insights: initialData.insights || '',
        recommendations: initialData.recommendations || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        researchData: {
          targetMarket: formData.targetMarket,
          marketSize: formData.marketSize,
          competitionLevel: formData.competitionLevel,
          entryBarriers: formData.entryBarriers,
          monetizationPotential: formData.monetizationPotential,
        },
      };

      if (isEditing && initialData?.id) {
        await api.put(`/market-analysis/market-research/${initialData.id}`, payload);
      } else {
        await api.post(`/market-analysis/projects/${projectId}/market-research`, payload);
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save market research');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Market Research' : 'Create Market Research'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Research Type</InputLabel>
              <Select
                value={formData.researchType}
                label="Research Type"
                onChange={(e) => handleChange('researchType', e.target.value)}
              >
                <MenuItem value="market_analysis">Market Analysis</MenuItem>
                <MenuItem value="competition_analysis">Competition Analysis</MenuItem>
                <MenuItem value="opportunity_assessment">Opportunity Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Target Market"
              value={formData.targetMarket}
              onChange={(e) => handleChange('targetMarket', e.target.value)}
              placeholder="e.g., Small businesses, Freelancers, Enterprise customers"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Market Size</InputLabel>
              <Select
                value={formData.marketSize}
                label="Market Size"
                onChange={(e) => handleChange('marketSize', e.target.value)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Competition Level</InputLabel>
              <Select
                value={formData.competitionLevel}
                label="Competition Level"
                onChange={(e) => handleChange('competitionLevel', e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Entry Barriers"
              value={formData.entryBarriers}
              onChange={(e) => handleChange('entryBarriers', e.target.value)}
              multiline
              rows={2}
              placeholder="e.g., High development costs, Regulatory requirements, Network effects"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Monetization Potential</InputLabel>
              <Select
                value={formData.monetizationPotential}
                label="Monetization Potential"
                onChange={(e) => handleChange('monetizationPotential', e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Key Insights"
              value={formData.insights}
              onChange={(e) => handleChange('insights', e.target.value)}
              multiline
              rows={3}
              placeholder="Key findings and insights from your research"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recommendations"
              value={formData.recommendations}
              onChange={(e) => handleChange('recommendations', e.target.value)}
              multiline
              rows={3}
              placeholder="Strategic recommendations based on your analysis"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MarketResearchForm; 