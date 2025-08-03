import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { timeTrackingAPI } from '../../services/api';

interface DeadlineAnalysis {
  projectId: string;
  title: string;
  daysUntilDeadline: number;
  isOverdue: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

const DeadlineAnalysis: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const response = await timeTrackingAPI.getDeadlines();
      setDeadlines(response.data.data);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      setError('Failed to load deadline analysis');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <WarningIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <ScheduleIcon color="info" />;
      case 'low': return <CheckCircleIcon color="success" />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTimeRemaining = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else {
      return `${days} days remaining`;
    }
  };

  const getSummaryStats = () => {
    const critical = deadlines.filter(d => d.urgency === 'critical').length;
    const high = deadlines.filter(d => d.urgency === 'high').length;
    const medium = deadlines.filter(d => d.urgency === 'medium').length;
    const low = deadlines.filter(d => d.urgency === 'low').length;
    const overdue = deadlines.filter(d => d.isOverdue).length;

    return { critical, high, medium, low, overdue };
  };

  const stats = getSummaryStats();

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

  return (
    <Card>
      <CardHeader
        title="Deadline Analysis"
        subheader="Track your project deadlines and get recommendations"
      />
      <CardContent>
        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="error">
                {stats.critical}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Critical
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {stats.high}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                High Priority
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {stats.medium}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Medium Priority
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {stats.low}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Low Priority
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {stats.overdue > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {stats.overdue} project{stats.overdue > 1 ? 's' : ''} overdue
            </Typography>
          </Alert>
        )}

        {deadlines.length === 0 ? (
          <Typography color="textSecondary" align="center">
            No projects with deadlines found
          </Typography>
        ) : (
          <List>
            {deadlines.map((deadline, index) => (
              <React.Fragment key={deadline.projectId}>
                <ListItem>
                  <ListItemIcon>
                    {getUrgencyIcon(deadline.urgency)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {deadline.title}
                        </Typography>
                        <Chip
                          label={deadline.urgency}
                          size="small"
                          color={getUrgencyColor(deadline.urgency) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {formatTimeRemaining(deadline.daysUntilDeadline)}
                        </Typography>
                        {deadline.recommendedActions.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" color="textSecondary">
                              Recommended actions:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {deadline.recommendedActions.map((action, actionIndex) => (
                                <li key={actionIndex}>
                                  <Typography variant="caption" color="textSecondary">
                                    {action}
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < deadlines.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineAnalysis; 