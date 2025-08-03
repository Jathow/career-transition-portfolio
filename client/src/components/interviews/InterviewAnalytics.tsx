import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

interface InterviewStats {
  total: number;
  upcoming: number;
  completed: number;
  passed: number;
  failed: number;
  cancelled: number;
  averageDuration: number;
}

interface InterviewAnalyticsProps {
  userId?: string;
}

const InterviewAnalytics: React.FC<InterviewAnalyticsProps> = ({ userId }) => {
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewStats();
  }, [userId]);

  const fetchInterviewStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/interviews/stats');
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to fetch interview statistics');
      console.error('Error fetching interview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (!stats || stats.completed === 0) return 0;
    return Math.round((stats.passed / stats.completed) * 100);
  };

  const getCompletionRate = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
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

  if (!stats) {
    return (
      <Alert severity="info">
        No interview data available.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AssessmentIcon color="primary" />
        <Typography variant="h5" component="h2">
          Interview Analytics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Interviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PendingIcon color="warning" />
                <Typography variant="h6">
                  {stats.upcoming}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Upcoming
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">
                  {stats.passed}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CancelIcon color="error" />
                <Typography variant="h6">
                  {stats.failed}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" color="primary">
                  {getSuccessRate()}%
                </Typography>
                <Chip 
                  label={`${stats.passed}/${stats.completed} interviews`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Percentage of completed interviews that resulted in a pass
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion Rate
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" color="secondary">
                  {getCompletionRate()}%
                </Typography>
                <Chip 
                  label={`${stats.completed}/${stats.total} interviews`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Percentage of scheduled interviews that have been completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interview Breakdown
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Passed Interviews"
                        secondary={`${stats.passed} interviews (${getSuccessRate()}% of completed)`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CancelIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Failed Interviews"
                        secondary={`${stats.failed} interviews (${stats.completed > 0 ? Math.round((stats.failed / stats.completed) * 100) : 0}% of completed)`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PendingIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Cancelled Interviews"
                        secondary={`${stats.cancelled} interviews`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Average Duration"
                        secondary={`${stats.averageDuration} minutes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Upcoming Interviews"
                        secondary={`${stats.upcoming} interviews scheduled`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Completion Rate"
                        secondary={`${getCompletionRate()}% of interviews completed`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Insights
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Typography variant="subtitle2" color="success.dark" gutterBottom>
                      Strengths
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Interview Completion"
                          secondary={`You've completed ${stats.completed} out of ${stats.total} interviews`}
                        />
                      </ListItem>
                      {stats.passed > 0 && (
                        <ListItem>
                          <ListItemText 
                            primary="Success Rate"
                            secondary={`${getSuccessRate()}% pass rate shows strong interview performance`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                      Areas for Improvement
                    </Typography>
                    <List dense>
                      {stats.failed > 0 && (
                        <ListItem>
                          <ListItemText 
                            primary="Failed Interviews"
                            secondary={`${stats.failed} interviews failed - review feedback for patterns`}
                          />
                        </ListItem>
                      )}
                      {stats.cancelled > 0 && (
                        <ListItem>
                          <ListItemText 
                            primary="Cancellations"
                            secondary={`${stats.cancelled} interviews cancelled - consider scheduling more carefully`}
                          />
                        </ListItem>
                      )}
                      {stats.upcoming > 0 && (
                        <ListItem>
                          <ListItemText 
                            primary="Upcoming Interviews"
                            secondary={`${stats.upcoming} interviews pending - stay prepared`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterviewAnalytics; 