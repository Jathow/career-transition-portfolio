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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { api } from '../../services/api';

interface RevenueMetricFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const RevenueMetricForm: React.FC<RevenueMetricFormProps> = ({
  projectId,
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    metricType: 'revenue',
    metricName: '',
    value: '',
    unit: 'dollars',
    period: 'monthly',
    date: new Date(),
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        metricType: initialData.metricType || 'revenue',
        metricName: initialData.metricName || '',
        value: initialData.value?.toString() || '',
        unit: initialData.unit || 'dollars',
        period: initialData.period || 'monthly',
        date: new Date(initialData.date) || new Date(),
        notes: initialData.notes || '',
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
        value: parseFloat(formData.value),
        date: formData.date.toISOString(),
      };

      if (isEditing && initialData?.id) {
        await api.put(`/revenue-tracking/revenue-metrics/${initialData.id}`, payload);
      } else {
        await api.post(`/revenue-tracking/projects/${projectId}/revenue-metrics`, payload);
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save revenue metric');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMetricNameSuggestions = () => {
    switch (formData.metricType) {
      case 'revenue':
        return ['Monthly Revenue', 'Annual Revenue', 'Subscription Revenue', 'One-time Sales'];
      case 'user_engagement':
        return ['Daily Active Users', 'Monthly Active Users', 'Session Duration', 'Page Views'];
      case 'conversion':
        return ['Conversion Rate', 'Sign-up Rate', 'Purchase Rate', 'Retention Rate'];
      case 'retention':
        return ['User Retention', 'Customer Retention', 'Churn Rate', 'Lifetime Value'];
      default:
        return [];
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Revenue Metric' : 'Add Revenue Metric'}
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
              <InputLabel>Metric Type</InputLabel>
              <Select
                value={formData.metricType}
                label="Metric Type"
                onChange={(e) => handleChange('metricType', e.target.value)}
              >
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="user_engagement">User Engagement</MenuItem>
                <MenuItem value="conversion">Conversion</MenuItem>
                <MenuItem value="retention">Retention</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Metric Name</InputLabel>
              <Select
                value={formData.metricName}
                label="Metric Name"
                onChange={(e) => handleChange('metricName', e.target.value)}
              >
                {getMetricNameSuggestions().map((suggestion) => (
                  <MenuItem key={suggestion} value={suggestion}>
                    {suggestion}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Metric</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.metricName === 'custom' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Metric Name"
                value={formData.metricName === 'custom' ? '' : formData.metricName}
                onChange={(e) => handleChange('metricName', e.target.value)}
                placeholder="Enter custom metric name"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              required
              inputProps={{ step: '0.01', min: '0' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <MenuItem value="dollars">Dollars ($)</MenuItem>
                <MenuItem value="users">Users</MenuItem>
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="sessions">Sessions</MenuItem>
                <MenuItem value="transactions">Transactions</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={formData.period}
                label="Period"
                onChange={(e) => handleChange('period', e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annually">Annually</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => handleChange('date', newValue || new Date())}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={3}
              placeholder="Additional notes about this metric"
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
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RevenueMetricForm; 