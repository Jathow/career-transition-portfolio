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
  Chip,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { createProject, updateProject, CreateProjectData } from '../../store/slices/projectSlice';
import { Project } from '../../store/slices/projectSlice';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess?: () => void;
}

const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' },
];

const COMMON_TECHNOLOGIES = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python', 'Django',
  'Flask', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'AWS', 'Git',
  'HTML', 'CSS', 'Tailwind CSS', 'Material-UI', 'Next.js', 'Vue.js', 'Angular'
];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  project,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    techStack: [],
    targetEndDate: '',
    status: 'PLANNING',
    repositoryUrl: '',
    liveUrl: '',
    revenueTracking: false,
    marketResearch: '',
  });

  const [newTech, setNewTech] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [targetEndDate, setTargetEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        targetEndDate: project.targetEndDate,
        status: project.status,
        repositoryUrl: project.repositoryUrl || '',
        liveUrl: project.liveUrl || '',
        revenueTracking: project.revenueTracking,
        marketResearch: project.marketResearch || '',
      });
      setStartDate(new Date(project.startDate));
      setTargetEndDate(new Date(project.targetEndDate));
    } else {
      // Reset form for new project
      setFormData({
        title: '',
        description: '',
        techStack: [],
        targetEndDate: '',
        status: 'PLANNING',
        repositoryUrl: '',
        liveUrl: '',
        revenueTracking: false,
        marketResearch: '',
      });
      setStartDate(new Date());
      setTargetEndDate(null);
    }
    setError(null);
  }, [project, open]);

  const handleInputChange = (field: keyof CreateProjectData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: keyof CreateProjectData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAddTechnology = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()],
      }));
      setNewTech('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  const handleAddCommonTech = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Project title is required';
    if (!formData.description.trim()) return 'Project description is required';
    if (formData.techStack.length === 0) return 'At least one technology is required';
    if (!targetEndDate) return 'Target end date is required';
    
    // Validate that target end date is after start date
    const start = startDate || new Date();
    
    if (targetEndDate <= start) {
      return 'Target end date must be after start date';
    }
    
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData: CreateProjectData = {
        ...formData,
        startDate: startDate?.toISOString(),
        targetEndDate: targetEndDate!.toISOString(),
      };

      if (project) {
        await dispatch(updateProject({ id: project.id, data: submitData })).unwrap();
      } else {
        await dispatch(createProject(submitData)).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {project ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Project Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              margin="normal"
              required
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              margin="normal"
              multiline
              rows={3}
              required
              inputProps={{ maxLength: 1000 }}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Technologies *
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {COMMON_TECHNOLOGIES.map(tech => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    variant={formData.techStack.includes(tech) ? 'filled' : 'outlined'}
                    onClick={() => handleAddCommonTech(tech)}
                    color={formData.techStack.includes(tech) ? 'primary' : 'default'}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Add custom technology"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                />
                <Button onClick={handleAddTechnology} variant="outlined" size="small">
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.techStack.map(tech => (
                  <Chip
                    key={tech}
                    label={tech}
                    onDelete={() => handleRemoveTechnology(tech)}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
              
              <DatePicker
                label="Target End Date *"
                value={targetEndDate}
                onChange={setTargetEndDate}
                minDate={startDate || undefined}
                slotProps={{
                  textField: { fullWidth: true, required: true }
                }}
              />
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleSelectChange('status')}
                label="Status"
              >
                {PROJECT_STATUSES.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Repository URL"
              value={formData.repositoryUrl}
              onChange={handleInputChange('repositoryUrl')}
              margin="normal"
              type="url"
            />

            <TextField
              fullWidth
              label="Live URL"
              value={formData.liveUrl}
              onChange={handleInputChange('liveUrl')}
              margin="normal"
              type="url"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.revenueTracking}
                  onChange={handleInputChange('revenueTracking')}
                />
              }
              label="Track Revenue Potential"
              sx={{ mt: 1 }}
            />

            {formData.revenueTracking && (
              <TextField
                fullWidth
                label="Market Research Notes"
                value={formData.marketResearch}
                onChange={handleInputChange('marketResearch')}
                margin="normal"
                multiline
                rows={3}
                inputProps={{ maxLength: 2000 }}
                helperText="Document market research, competition analysis, and monetization ideas"
              />
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (project ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};