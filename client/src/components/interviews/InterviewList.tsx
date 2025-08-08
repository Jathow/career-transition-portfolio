import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { api } from '../../services/api';

interface Interview {
  id: string;
  interviewType: string;
  scheduledDate: string;
  duration: number;
  interviewerName?: string;
  outcome: string;
  application: {
    id: string;
    companyName: string;
    jobTitle: string;
  };
}

interface InterviewListProps {
  applicationId?: string;
  onInterviewSelect?: (interview: Interview) => void;
}

const InterviewList: React.FC<InterviewListProps> = ({ applicationId, onInterviewSelect }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [filters, setFilters] = useState({
    interviewType: '',
    outcome: ''
  });

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (applicationId) {
        params.append('applicationId', applicationId);
      }
      if (filters.interviewType) {
        params.append('interviewType', filters.interviewType);
      }
      if (filters.outcome) {
        params.append('outcome', filters.outcome);
      }

      const response = await api.get(`/interviews?${params.toString()}`);
      setInterviews(response.data.data);
    } catch (err) {
      setError('Failed to fetch interviews');
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [applicationId, filters]);

  const handleDeleteInterview = async (interviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }

    try {
      await api.delete(`/interviews/${interviewId}`);
      fetchInterviews();
    } catch (err) {
      setError('Failed to delete interview');
      console.error('Error deleting interview:', err);
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'TECHNICAL':
        return 'error';
      case 'ONSITE':
        return 'warning';
      case 'VIDEO':
        return 'info';
      case 'PHONE':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Interviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          data-tour="new-interview"
        >
          Schedule Interview
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Interview Type</InputLabel>
            <Select
              value={filters.interviewType}
              label="Interview Type"
              onChange={(e) => setFilters({ ...filters, interviewType: e.target.value })}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="PHONE">Phone</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="ONSITE">Onsite</MenuItem>
              <MenuItem value="TECHNICAL">Technical</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Outcome</InputLabel>
            <Select
              value={filters.outcome}
              label="Outcome"
              onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
            >
              <MenuItem value="">All Outcomes</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PASSED">Passed</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {interviews.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No interviews found. Schedule your first interview to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {interviews.map((interview) => (
            <Grid item xs={12} key={interview.id}>
              <Card 
                sx={{ 
                  cursor: onInterviewSelect ? 'pointer' : 'default',
                  '&:hover': onInterviewSelect ? { boxShadow: 3 } : {}
                }}
                onClick={() => onInterviewSelect?.(interview)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" component="h3">
                          {interview.application.companyName}
                        </Typography>
                        <Chip
                          label={interview.interviewType}
                          size="small"
                          color={getInterviewTypeColor(interview.interviewType) as any}
                        />
                        <Chip
                          label={interview.outcome}
                          size="small"
                          color={getOutcomeColor(interview.outcome) as any}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {interview.application.jobTitle}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EventIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {format(new Date(interview.scheduledDate), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {interview.duration} minutes
                          </Typography>
                        </Box>

                        {interview.interviewerName && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {interview.interviewerName}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInterview(interview);
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInterview(interview.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Interview Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedInterview ? 'Edit Interview' : 'Schedule Interview'}
        </DialogTitle>
        <DialogContent>
          <InterviewForm
            interview={selectedInterview}
            applicationId={applicationId}
            onSuccess={() => {
              setOpenDialog(false);
              setSelectedInterview(null);
              fetchInterviews();
            }}
            onCancel={() => {
              setOpenDialog(false);
              setSelectedInterview(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Interview Form Component
interface InterviewFormProps {
  interview?: Interview | null;
  applicationId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ interview, applicationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    applicationId: applicationId || '',
    interviewType: interview?.interviewType || 'PHONE',
    scheduledDate: interview ? format(new Date(interview.scheduledDate), "yyyy-MM-dd'T'HH:mm") : '',
    duration: interview?.duration || 60,
    interviewerName: interview?.interviewerName || '',
    preparationNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (interview) {
        await api.put(`/interviews/${interview.id}`, formData);
      } else {
        await api.post('/interviews', formData);
      }
      onSuccess();
    } catch (err) {
      setError('Failed to save interview');
      console.error('Error saving interview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Interview Type"
            select
            value={formData.interviewType}
            onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
            required
          >
            <MenuItem value="PHONE">Phone</MenuItem>
            <MenuItem value="VIDEO">Video</MenuItem>
            <MenuItem value="ONSITE">Onsite</MenuItem>
            <MenuItem value="TECHNICAL">Technical</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Scheduled Date & Time"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
            inputProps={{ min: 15, max: 480 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Interviewer Name"
            value={formData.interviewerName}
            onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Preparation Notes"
            multiline
            rows={3}
            value={formData.preparationNotes}
            onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
            placeholder="Add any notes or preparation reminders..."
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : (interview ? 'Update' : 'Schedule')}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default InterviewList; 