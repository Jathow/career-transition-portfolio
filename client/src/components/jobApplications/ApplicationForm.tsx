import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { 
  createApplication, 
  updateApplication, 
  CreateJobApplicationData,
  UpdateJobApplicationData,
  JobApplication 
} from '../../store/slices/jobApplicationSlice';
import { fetchResumes } from '../../store/slices/resumeSlice';
import { logger } from '../../utils/logger';

interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  application?: JobApplication | null;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  open, 
  onClose, 
  application 
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.jobApplications);
  const { resumes } = useAppSelector((state) => state.resumes);

  const [formData, setFormData] = useState<CreateJobApplicationData>({
    resumeId: '',
    companyName: '',
    jobTitle: '',
    jobUrl: '',
    coverLetter: '',
    notes: '',
    followUpDate: '',
    companyResearch: '',
    preparationNotes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      dispatch(fetchResumes());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (application) {
      setFormData({
        resumeId: application.resumeId,
        companyName: application.companyName,
        jobTitle: application.jobTitle,
        jobUrl: application.jobUrl,
        coverLetter: application.coverLetter || '',
        notes: application.notes || '',
        followUpDate: application.followUpDate || '',
        companyResearch: application.companyResearch || '',
        preparationNotes: application.preparationNotes || ''
      });
    } else {
      setFormData({
        resumeId: '',
        companyName: '',
        jobTitle: '',
        jobUrl: '',
        coverLetter: '',
        notes: '',
        followUpDate: '',
        companyResearch: '',
        preparationNotes: ''
      });
    }
    setValidationErrors({});
  }, [application]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.resumeId) {
      errors.resumeId = 'Resume is required';
    }
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (!formData.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    }
    if (!formData.jobUrl.trim()) {
      errors.jobUrl = 'Job URL is required';
    } else if (!isValidUrl(formData.jobUrl)) {
      errors.jobUrl = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof CreateJobApplicationData, value: string) => {
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (application) {
        // Update existing application
        const updateData: UpdateJobApplicationData = {
          companyName: formData.companyName,
          jobTitle: formData.jobTitle,
          jobUrl: formData.jobUrl,
          coverLetter: formData.coverLetter,
          notes: formData.notes,
          followUpDate: formData.followUpDate,
          companyResearch: formData.companyResearch,
          preparationNotes: formData.preparationNotes
        };
        await dispatch(updateApplication({ id: application.id, data: updateData })).unwrap();
      } else {
        // Create new application
        await dispatch(createApplication(formData)).unwrap();
      }
      onClose();
    } catch (error) {
      logger.error('Error saving application', error);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {application ? 'Edit Job Application' : 'New Job Application'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth error={!!validationErrors.resumeId}>
            <InputLabel>Resume Version</InputLabel>
            <Select
              value={formData.resumeId}
              onChange={(e) => handleInputChange('resumeId', e.target.value)}
              label="Resume Version"
            >
              {resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.versionName}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.resumeId && (
              <Typography variant="caption" color="error">
                {validationErrors.resumeId}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            fullWidth
            error={!!validationErrors.companyName}
            helperText={validationErrors.companyName}
            required
          />

          <TextField
            label="Job Title"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            fullWidth
            error={!!validationErrors.jobTitle}
            helperText={validationErrors.jobTitle}
            required
          />

          <TextField
            label="Job URL"
            value={formData.jobUrl}
            onChange={(e) => handleInputChange('jobUrl', e.target.value)}
            fullWidth
            error={!!validationErrors.jobUrl}
            helperText={validationErrors.jobUrl}
            required
            placeholder="https://example.com/job-posting"
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Follow-up Date (Optional)"
              value={formData.followUpDate ? new Date(formData.followUpDate) : null}
              onChange={(date) => handleInputChange('followUpDate', date ? date.toISOString() : '')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Set a reminder to follow up on this application'
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Cover Letter (Optional)"
            value={formData.coverLetter}
            onChange={(e) => handleInputChange('coverLetter', e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Paste your cover letter here..."
          />

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any additional notes about this application..."
          />

          <TextField
            label="Company Research (Optional)"
            value={formData.companyResearch}
            onChange={(e) => handleInputChange('companyResearch', e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Research about the company, culture, recent news, products/services..."
            helperText="Research the company to prepare for interviews and tailor your application"
          />

          <TextField
            label="Preparation Notes (Optional)"
            value={formData.preparationNotes}
            onChange={(e) => handleInputChange('preparationNotes', e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Interview preparation notes, questions to ask, key points to highlight..."
            helperText="Notes for interview preparation and application strategy"
          />
        </Box>
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
          {application ? 'Update' : 'Create'} Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationForm; 