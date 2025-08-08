import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { 
  fetchApplicationsNeedingFollowUp,
  updateApplicationStatus,
  updateApplication,
  JobApplication 
} from '../../store/slices/jobApplicationSlice';

const FollowUpReminders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applicationsNeedingFollowUp, loading, error } = useAppSelector(
    (state) => state.jobApplications
  );

  useEffect(() => {
    dispatch(fetchApplicationsNeedingFollowUp());
  }, [dispatch]);

  const handleMarkAsFollowedUp = async (application: JobApplication) => {
    try {
      // Update status to indicate follow-up was done
      await dispatch(updateApplicationStatus({ 
        id: application.id, 
        status: application.status === 'APPLIED' ? 'SCREENING' : 'INTERVIEW' 
      })).unwrap();
      
      // Refresh the follow-up list
      dispatch(fetchApplicationsNeedingFollowUp());
    } catch (error) {
      console.error('Error marking as followed up:', error);
    }
  };

  const handleScheduleNewFollowUp = async (application: JobApplication) => {
    // Suggest a follow-up date based on current status
    const now = new Date();
    const days = application.status === 'APPLIED' ? 7 : application.status === 'SCREENING' ? 5 : 3;
    const suggested = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days).toISOString();
    await dispatch(updateApplication({ id: application.id, data: { followUpDate: suggested } }));
    dispatch(fetchApplicationsNeedingFollowUp());
  };

  const getDaysOverdue = (followUpDate: string) => {
    const followUp = new Date(followUpDate);
    const today = new Date();
    const diffTime = today.getTime() - followUp.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysOverdue: number) => {
    if (daysOverdue <= 0) return 'success';
    if (daysOverdue <= 3) return 'warning';
    return 'error';
  };

  const getUrgencyText = (daysOverdue: number) => {
    if (daysOverdue <= 0) return 'Due today';
    if (daysOverdue === 1) return '1 day overdue';
    return `${daysOverdue} days overdue`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (applicationsNeedingFollowUp.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            All caught up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No applications need follow-up at this time.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Follow-up Reminders
        </Typography>
        <Chip
          label={`${applicationsNeedingFollowUp.length} pending`}
          color="warning"
          variant="outlined"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          These applications are due for follow-up. Consider reaching out to check on the status of your application.
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        {applicationsNeedingFollowUp.map((application) => {
          const daysOverdue = getDaysOverdue(application.followUpDate!);
          const urgencyColor = getUrgencyColor(daysOverdue);
          const urgencyText = getUrgencyText(daysOverdue);

          return (
            <Grid item xs={12} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon color="action" fontSize="small" />
                        <Typography variant="h6" component="h3">
                          {application.companyName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkIcon color="action" fontSize="small" />
                        <Typography variant="body1" color="text.secondary">
                          {application.jobTitle}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          Applied: {formatDate(application.applicationDate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Follow-up due: {formatDate(application.followUpDate!)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={application.status}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={urgencyText}
                          color={urgencyColor as any}
                          size="small"
                          variant={daysOverdue > 0 ? "filled" : "outlined"}
                        />
                      </Box>

                      {application.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Last note: {application.notes.length > 100 
                            ? `${application.notes.substring(0, 100)}...` 
                            : application.notes}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      <Tooltip title="View job posting">
                        <IconButton
                          size="small"
                          onClick={() => window.open(application.jobUrl, '_blank')}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<EmailIcon />}
                      onClick={() => handleMarkAsFollowedUp(application)}
                      color="primary"
                      size="small"
                    >
                      Mark as Followed Up
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleScheduleNewFollowUp(application)}
                      size="small"
                    >
                      Schedule New Follow-up
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      size="small"
                      onClick={() => {
                        // This would typically open a dialog to log a phone call
                        handleMarkAsFollowedUp(application);
                      }}
                    >
                      Log Phone Call
                    </Button>
                  </Box>

                  {daysOverdue > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        This application is {urgencyText}. Consider reaching out soon to maintain momentum.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Follow-up Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Follow-up Best Practices
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Email Follow-up"
                secondary="Send a polite email 1-2 weeks after applying to check on your application status"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Phone Follow-up"
                secondary="Call the hiring manager or HR department for a more personal touch"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="LinkedIn Connection"
                secondary="Connect with the hiring manager on LinkedIn and send a personalized message"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Keep Records"
                secondary="Document all follow-up attempts and responses for future reference"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FollowUpReminders; 