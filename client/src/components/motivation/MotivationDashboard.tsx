import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  EmojiEvents,
  Flag,
  Psychology,
  CheckCircle,
  Warning,
  Info,
  Celebration,
  AccessTime,
  Star,
  LocalFireDepartment,
  TrackChanges,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchMotivationDashboard,
  markFeedbackAsRead,
} from '../../store/slices/motivationSlice';
import DailyActivityLog from './DailyActivityLog';
import GoalForm from './GoalForm';
import ProgressChart from './ProgressChart';

const MotivationDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    dashboard,
    progressStats,
    goals,
    achievements,
    motivationalFeedback,
    loading,
    error,
  } = useAppSelector((state) => state.motivation);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showDailyLog, setShowDailyLog] = useState(false);

  useEffect(() => {
    dispatch(fetchMotivationDashboard());
  }, [dispatch]);

  const handleMarkFeedbackAsRead = (feedbackId: string) => {
    dispatch(markFeedbackAsRead(feedbackId));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp color="success" />;
      case 'declining':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <Celebration color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'guidance':
        return <Psychology color="info" />;
      case 'encouragement':
        return <Star color="primary" />;
      default:
        return <Info color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && !dashboard) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <LinearProgress style={{ width: '100%' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Motivation Dashboard
      </Typography>

      {/* Quick Actions */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AccessTime />}
              onClick={() => setShowDailyLog(true)}
            >
              Log Today's Activity
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
                              startIcon={<TrackChanges />}
              onClick={() => setShowGoalForm(true)}
              data-tour="new-goal"
            >
              Set New Goal
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Statistics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress Overview
              </Typography>
              {progressStats && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {progressStats.totalCodingHours.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Coding Hours
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                        {getTrendIcon(progressStats.moodTrend)}
                        <Typography variant="caption" ml={0.5}>
                          {progressStats.averageDailyCoding.toFixed(1)}/day
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="secondary">
                        {progressStats.totalApplications}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Applications
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                        {getTrendIcon(progressStats.productivityTrend)}
                        <Typography variant="caption" ml={0.5}>
                          {progressStats.averageDailyApplications.toFixed(1)}/day
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {progressStats.currentStreak}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Day Streak
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                        <LocalFireDepartment color="warning" />
                        <Typography variant="caption" ml={0.5}>
                          Best: {progressStats.longestStreak}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {progressStats.achievementsUnlocked}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Achievements
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                        <EmojiEvents color="warning" />
                        <Typography variant="caption" ml={0.5}>
                          Unlocked
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Goals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Active Goals ({goals.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<TrackChanges />}
                  onClick={() => setShowGoalForm(true)}
                >
                  Add Goal
                </Button>
              </Box>
              {goals.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No active goals. Set your first goal to get started!
                </Typography>
              ) : (
                <List dense>
                  {goals.slice(0, 3).map((goal) => (
                    <ListItem key={goal.id} disablePadding>
                      <ListItemIcon>
                        <Flag color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={goal.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(goal.currentValue / goal.targetValue) * 100}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <Chip
                        label={goal.priority}
                        size="small"
                        color={getPriorityColor(goal.priority) as any}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Motivational Feedback */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Motivational Guidance
              </Typography>
              {motivationalFeedback.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No new guidance at the moment. Keep up the great work!
                </Typography>
              ) : (
                <List>
                  {motivationalFeedback.slice(0, 3).map((feedback) => (
                    <ListItem
                      key={feedback.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: feedback.isRead ? 'transparent' : 'action.hover',
                      }}
                    >
                      <ListItemIcon>
                        {getFeedbackIcon(feedback.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {feedback.title}
                            </Typography>
                            <Chip
                              label={feedback.priority}
                              size="small"
                              color={getPriorityColor(feedback.priority) as any}
                            />
                          </Box>
                        }
                        secondary={feedback.message}
                      />
                      {!feedback.isRead && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkFeedbackAsRead(feedback.id)}
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              {achievements.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No achievements yet. Complete goals to unlock achievements!
                </Typography>
              ) : (
                <List>
                  {achievements.slice(0, 3).map((achievement) => (
                    <ListItem key={achievement.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          {achievement.icon || <EmojiEvents />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.title}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {achievement.description}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress Timeline
              </Typography>
              <ProgressChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modals */}
      {showDailyLog && (
        <DailyActivityLog
          open={showDailyLog}
          onClose={() => setShowDailyLog(false)}
        />
      )}

      {showGoalForm && (
        <GoalForm
          open={showGoalForm}
          onClose={() => setShowGoalForm(false)}
        />
      )}
    </Box>
  );
};

export default MotivationDashboard; 