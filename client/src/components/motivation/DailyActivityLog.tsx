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
  Box,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logDailyActivity } from '../../store/slices/motivationSlice';

interface DailyActivityLogProps {
  open: boolean;
  onClose: () => void;
}

const DailyActivityLog: React.FC<DailyActivityLogProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.motivation);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    codingMinutes: 0,
    applicationsSubmitted: 0,
    learningMinutes: 0,
    notes: '',
    mood: '',
    energyLevel: 5,
    productivity: 5,
    challenges: '',
    achievements: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        codingMinutes: 0,
        applicationsSubmitted: 0,
        learningMinutes: 0,
        notes: '',
        mood: '',
        energyLevel: 5,
        productivity: 5,
        challenges: '',
        achievements: '',
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

    if (formData.codingMinutes < 0) {
      errors.codingMinutes = 'Coding minutes cannot be negative';
    }

    if (formData.applicationsSubmitted < 0) {
      errors.applicationsSubmitted = 'Applications cannot be negative';
    }

    if (formData.learningMinutes < 0) {
      errors.learningMinutes = 'Learning minutes cannot be negative';
    }

    if (formData.energyLevel < 1 || formData.energyLevel > 10) {
      errors.energyLevel = 'Energy level must be between 1 and 10';
    }

    if (formData.productivity < 1 || formData.productivity > 10) {
      errors.productivity = 'Productivity must be between 1 and 10';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(logDailyActivity(formData)).unwrap();
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Log Today's Activity</Typography>
        <Typography variant="body2" color="textSecondary">
          Track your daily progress and maintain motivation
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!validationErrors.date}
              helperText={validationErrors.date}
            />
          </Grid>

          {/* Coding Minutes */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Coding Time (minutes)"
              type="number"
              value={formData.codingMinutes}
              onChange={(e) => handleInputChange('codingMinutes', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 1440 }}
              error={!!validationErrors.codingMinutes}
              helperText={validationErrors.codingMinutes || 'Time spent coding today'}
            />
          </Grid>

          {/* Applications Submitted */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Applications Submitted"
              type="number"
              value={formData.applicationsSubmitted}
              onChange={(e) => handleInputChange('applicationsSubmitted', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
              error={!!validationErrors.applicationsSubmitted}
              helperText={validationErrors.applicationsSubmitted || 'Number of job applications submitted'}
            />
          </Grid>

          {/* Learning Minutes */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Learning Time (minutes)"
              type="number"
              value={formData.learningMinutes}
              onChange={(e) => handleInputChange('learningMinutes', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 1440 }}
              error={!!validationErrors.learningMinutes}
              helperText={validationErrors.learningMinutes || 'Time spent learning new skills'}
            />
          </Grid>

          {/* Mood */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Mood</InputLabel>
              <Select
                value={formData.mood}
                label="Mood"
                onChange={(e) => handleInputChange('mood', e.target.value)}
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="okay">Okay</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Energy Level */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography gutterBottom>Energy Level (1-10)</Typography>
              <Slider
                value={formData.energyLevel}
                onChange={(_, value) => handleInputChange('energyLevel', value)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
              {validationErrors.energyLevel && (
                <Typography color="error" variant="caption">
                  {validationErrors.energyLevel}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Productivity */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography gutterBottom>Productivity (1-10)</Typography>
              <Slider
                value={formData.productivity}
                onChange={(_, value) => handleInputChange('productivity', value)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
              {validationErrors.productivity && (
                <Typography color="error" variant="caption">
                  {validationErrors.productivity}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Challenges */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Challenges Faced"
              multiline
              rows={2}
              value={formData.challenges}
              onChange={(e) => handleInputChange('challenges', e.target.value)}
              placeholder="What challenges did you face today?"
              helperText="Optional: Document any obstacles or difficulties"
            />
          </Grid>

          {/* Achievements */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Achievements & Wins"
              multiline
              rows={2}
              value={formData.achievements}
              onChange={(e) => handleInputChange('achievements', e.target.value)}
              placeholder="What did you accomplish today?"
              helperText="Optional: Celebrate your wins and progress"
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional thoughts or observations..."
              helperText="Optional: General notes about your day"
            />
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
          {loading ? 'Saving...' : 'Save Activity Log'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DailyActivityLog; 