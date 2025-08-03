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

interface MonetizationStrategyFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const MonetizationStrategyForm: React.FC<MonetizationStrategyFormProps> = ({
  projectId,
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    strategyType: 'subscription',
    title: '',
    description: '',
    targetAudience: '',
    pricingModel: '',
    revenueProjection: '',
    implementationPlan: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        strategyType: initialData.strategyType || 'subscription',
        title: initialData.title || '',
        description: initialData.description || '',
        targetAudience: initialData.targetAudience || '',
        pricingModel: initialData.pricingModel || '',
        revenueProjection: initialData.revenueProjection?.toString() || '',
        implementationPlan: initialData.implementationPlan || '',
        status: initialData.status || 'PLANNING',
        priority: initialData.priority || 'MEDIUM',
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
        revenueProjection: formData.revenueProjection ? parseFloat(formData.revenueProjection) : null,
      };

      if (isEditing && initialData?.id) {
        await api.put(`/revenue-tracking/monetization-strategies/${initialData.id}`, payload);
      } else {
        await api.post(`/revenue-tracking/projects/${projectId}/monetization-strategies`, payload);
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save monetization strategy');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPricingModelSuggestions = () => {
    switch (formData.strategyType) {
      case 'subscription':
        return ['Monthly Subscription', 'Annual Subscription', 'Tiered Pricing', 'Freemium + Premium'];
      case 'freemium':
        return ['Free + Premium Features', 'Free + Ads', 'Free + Pro Version', 'Free + Enterprise'];
      case 'ads':
        return ['Display Ads', 'Sponsored Content', 'Affiliate Marketing', 'Native Advertising'];
      case 'marketplace':
        return ['Commission-based', 'Transaction Fee', 'Listing Fee', 'Subscription + Commission'];
      case 'saas':
        return ['Per-user Pricing', 'Usage-based Pricing', 'Tiered Plans', 'Enterprise Pricing'];
      default:
        return [];
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Monetization Strategy' : 'Create Monetization Strategy'}
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
              <InputLabel>Strategy Type</InputLabel>
              <Select
                value={formData.strategyType}
                label="Strategy Type"
                onChange={(e) => handleChange('strategyType', e.target.value)}
              >
                <MenuItem value="subscription">Subscription</MenuItem>
                <MenuItem value="freemium">Freemium</MenuItem>
                <MenuItem value="ads">Advertising</MenuItem>
                <MenuItem value="marketplace">Marketplace</MenuItem>
                <MenuItem value="saas">SaaS</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Strategy Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., Premium Subscription Plan"
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
              placeholder="Describe your monetization strategy in detail"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              placeholder="e.g., Small business owners, Freelancers, Enterprise customers"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Pricing Model</InputLabel>
              <Select
                value={formData.pricingModel}
                label="Pricing Model"
                onChange={(e) => handleChange('pricingModel', e.target.value)}
              >
                {getPricingModelSuggestions().map((suggestion) => (
                  <MenuItem key={suggestion} value={suggestion}>
                    {suggestion}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Pricing Model</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.pricingModel === 'custom' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Pricing Model"
                value={formData.pricingModel === 'custom' ? '' : formData.pricingModel}
                onChange={(e) => handleChange('pricingModel', e.target.value)}
                placeholder="Describe your custom pricing model"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Revenue Projection (Monthly)"
              type="number"
              value={formData.revenueProjection}
              onChange={(e) => handleChange('revenueProjection', e.target.value)}
              placeholder="0.00"
              inputProps={{ step: '0.01', min: '0' }}
              InputProps={{
                startAdornment: <span>$</span>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="PLANNING">Planning</MenuItem>
                <MenuItem value="IMPLEMENTING">Implementing</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PAUSED">Paused</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Implementation Plan"
              value={formData.implementationPlan}
              onChange={(e) => handleChange('implementationPlan', e.target.value)}
              multiline
              rows={4}
              placeholder="Step-by-step plan for implementing this monetization strategy"
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

export default MonetizationStrategyForm; 