import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { createGoal } from '../../store/slices/motivationSlice';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.motivation);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'custom',
    targetValue: 1,
    unit: 'hours',
    endDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Set default end date to 1 week from now
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      
      setFormData({
        title: '',
        description: '',
        type: 'weekly',
        targetValue: 1,
        unit: 'hours',
        endDate: defaultEndDate.toISOString().split('T')[0],
        priority: 'MEDIUM',
      });
      setValidationErrors({});
    }
  }, [open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Goal title is required';
    }

    if (formData.targetValue <= 0) {
      errors.targetValue = 'Target value must be greater than 0';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        errors.endDate = 'End date cannot be in the past';
      }
    }

    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createGoal(formData)).unwrap();
      onClose();
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getUnitOptions = () => {
    const commonUnits = ['hours', 'minutes', 'applications', 'projects', 'days', 'pages', 'lessons'];
    return commonUnits.map(unit => (
      <MenuItem key={unit} value={unit}>
        {unit.charAt(0).toUpperCase() + unit.slice(1)}
      </MenuItem>
    ));
  };

  const getGoalTypeDescription = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Complete within 1 week';
      case 'monthly':
        return 'Complete within 1 month';
      case 'custom':
        return 'Custom timeframe';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Set New Goal</Typography>
        <Typography variant="body2" color="textSecondary">
          Create a specific, measurable goal to track your progress
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Goal Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Goal Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Complete 3 portfolio projects"
              error={!!validationErrors.title}
              helperText={validationErrors.title || 'Give your goal a clear, specific title'}
              required
            />
          </Grid>

          {/* Goal Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide more details about your goal..."
              helperText="Optional: Add context and motivation for this goal"
            />
          </Grid>

          {/* Goal Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={formData.type}
                label="Goal Type"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {getGoalTypeDescription(formData.type)}
            </Typography>
          </Grid>

          {/* End Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!validationErrors.endDate}
              helperText={validationErrors.endDate || 'When do you want to complete this goal?'}
              required
            />
          </Grid>

          {/* Target Value */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Target Value"
              type="number"
              value={formData.targetValue}
              onChange={(e) => handleInputChange('targetValue', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0.1, step: 0.1 }}
              error={!!validationErrors.targetValue}
              helperText={validationErrors.targetValue || 'What is your target?'}
              required
            />
          </Grid>

          {/* Unit */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => handleInputChange('unit', e.target.value)}
                error={!!validationErrors.unit}
              >
                {getUnitOptions()}
                <MenuItem value="custom">
                  <TextField
                    size="small"
                    placeholder="Custom unit"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    sx={{ minWidth: 120 }}
                  />
                </MenuItem>
              </Select>
            </FormControl>
            {validationErrors.unit && (
              <Typography color="error" variant="caption">
                {validationErrors.unit}
              </Typography>
            )}
          </Grid>

          {/* Priority */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <MenuItem value="LOW">Low Priority</MenuItem>
                <MenuItem value="MEDIUM">Medium Priority</MenuItem>
                <MenuItem value="HIGH">High Priority</MenuItem>
                <MenuItem value="CRITICAL">Critical Priority</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Priority helps you focus on the most important goals
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalForm; 