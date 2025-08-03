import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Note as NoteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  updateApplicationStatus,
  addApplicationNotes,
  JobApplication
} from '../../store/slices/jobApplicationSlice';
import { logger } from '../../utils/logger';

interface ApplicationDetailProps {
  open: boolean;
  onClose: () => void;
  application: JobApplication | null;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  open,
  onClose,
  application
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.jobApplications);

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(application?.status || '');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleStatusUpdate = async () => {
    if (application && newStatus !== application.status) {
      try {
        await dispatch(updateApplicationStatus({ id: application.id, status: newStatus }) as any).unwrap();
        setIsEditingStatus(false);
      } catch (error) {
        logger.error('Error updating status', error);
      }
    }
  };

  const handleAddNote = async () => {
    if (application && newNote.trim()) {
      try {
        await dispatch(addApplicationNotes({ id: application.id, notes: newNote.trim() }) as any).unwrap();
        setNewNote('');
        setIsAddingNote(false);
      } catch (error) {
        logger.error('Error adding note', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'default';
      case 'SCREENING':
        return 'info';
      case 'INTERVIEW':
        return 'warning';
      case 'OFFER':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'WITHDRAWN':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!application) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {application.companyName} - {application.jobTitle}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon color="action" fontSize="small" />
                      <Typography variant="body1">
                        <strong>Company:</strong> {application.companyName}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WorkIcon color="action" fontSize="small" />
                      <Typography variant="body1">
                        <strong>Position:</strong> {application.jobTitle}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon color="action" fontSize="small" />
                      <Typography variant="body1">
                        <strong>Applied:</strong> {formatDate(application.applicationDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body1">
                        <strong>Status:</strong>
                      </Typography>
                      {isEditingStatus ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                            >
                              <MenuItem value="APPLIED">Applied</MenuItem>
                              <MenuItem value="SCREENING">Screening</MenuItem>
                              <MenuItem value="INTERVIEW">Interview</MenuItem>
                              <MenuItem value="OFFER">Offer</MenuItem>
                              <MenuItem value="REJECTED">Rejected</MenuItem>
                              <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleStatusUpdate}
                            disabled={loading}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setIsEditingStatus(false);
                              setNewStatus(application.status);
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={application.status}
                            color={getStatusColor(application.status) as any}
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              setIsEditingStatus(true);
                              setNewStatus(application.status);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  
                  {application.followUpDate && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon color="action" fontSize="small" />
                        <Typography variant="body1">
                          <strong>Follow-up:</strong> {formatDate(application.followUpDate)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LinkIcon color="action" fontSize="small" />
                      <Typography variant="body1">
                        <strong>Job URL:</strong>{' '}
                        <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
                          {application.jobUrl}
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {application.resume && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DescriptionIcon color="action" fontSize="small" />
                        <Typography variant="body1">
                          <strong>Resume Version:</strong> {application.resume.versionName}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cover Letter
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.coverLetter}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Notes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Notes & Updates
                  </Typography>
                  <Button
                    startIcon={<NoteIcon />}
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    size="small"
                  >
                    Add Note
                  </Button>
                </Box>
                
                {isAddingNote && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add a note about this application..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || loading}
                        size="small"
                      >
                        Add Note
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNote('');
                        }}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {application.notes ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.notes}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No notes yet. Add a note to track your progress and thoughts about this application.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Company Research */}
          {application.companyResearch && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Research
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.companyResearch}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Preparation Notes */}
          {application.preparationNotes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preparation Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.preparationNotes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Interviews */}
          {application.interviews && application.interviews.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Interviews
                  </Typography>
                  {application.interviews.map((interview, _index) => (
                    <Box key={interview.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {interview.interviewType} Interview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Scheduled: {formatDateTime(interview.scheduledDate)}
                      </Typography>
                      <Chip
                        label={interview.outcome}
                        color={interview.outcome === 'PASSED' ? 'success' : 
                               interview.outcome === 'FAILED' ? 'error' : 'default'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Timeline */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      {formatDateTime(application.createdAt)}
                    </Typography>
                    <Typography variant="body2">
                      Application created
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      {formatDateTime(application.updatedAt)}
                    </Typography>
                    <Typography variant="body2">
                      Last updated
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationDetail; 