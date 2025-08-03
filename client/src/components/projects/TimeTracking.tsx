import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { timeTrackingAPI, projectAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Project {
  id: string;
  title: string;
  status: string;
}

interface DailyProgress {
  date: string;
  totalProjects: number;
  completedToday: number;
  averageProgress: number;
}

const TimeTracking: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchDailyProgress();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProgress = async () => {
    try {
      await timeTrackingAPI.getStats();
      // Mock data for now since the endpoint might not be implemented yet
      const mockData: DailyProgress[] = [
        { date: '2024-01-01', totalProjects: 5, completedToday: 1, averageProgress: 65 },
        { date: '2024-01-02', totalProjects: 5, completedToday: 0, averageProgress: 70 },
        { date: '2024-01-03', totalProjects: 4, completedToday: 1, averageProgress: 75 },
        { date: '2024-01-04', totalProjects: 4, completedToday: 0, averageProgress: 80 },
        { date: '2024-01-05', totalProjects: 3, completedToday: 1, averageProgress: 85 },
        { date: '2024-01-06', totalProjects: 3, completedToday: 0, averageProgress: 90 },
        { date: '2024-01-07', totalProjects: 2, completedToday: 1, averageProgress: 95 },
      ];
      setDailyProgress(mockData);
    } catch (error) {
      console.error('Error fetching daily progress:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !timeSpent || !activity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Mock API call for now
      // const response = await timeTrackingAPI.trackTime({
      //   projectId: selectedProject,
      //   timeSpent: parseInt(timeSpent),
      //   activity,
      //   notes,
      //   date: new Date().toISOString(),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Time tracking entry added successfully!');
      setSelectedProject('');
      setTimeSpent('');
      setActivity('');
      setNotes('');
      
      // Refresh data
      fetchDailyProgress();
    } catch (error) {
      console.error('Error tracking time:', error);
      setError('Failed to add time tracking entry');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = {
    labels: dailyProgress.map(d => d.date),
    datasets: [
      {
        label: 'Average Progress (%)',
        data: dailyProgress.map(d => d.averageProgress),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Completed Today',
        data: dailyProgress.map(d => d.completedToday),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Progress Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const activeProjects = projects.filter(p => ['PLANNING', 'IN_PROGRESS'].includes(p.status));
  const completedToday = dailyProgress[dailyProgress.length - 1]?.completedToday || 0;
  const averageProgress = dailyProgress[dailyProgress.length - 1]?.averageProgress || 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Tracking
      </Typography>

      <Grid container spacing={3}>
        {/* Time Tracking Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Log Time Spent" />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    label="Project"
                    required
                  >
                    {activeProjects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Time Spent (minutes)"
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  required
                  inputProps={{ min: 1, max: 1440 }}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  required
                  placeholder="e.g., Feature development, Bug fixing, Testing"
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Additional notes about the work done..."
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={submitting}
                >
                  {submitting ? 'Adding Entry...' : 'Add Time Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Quick Stats" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {activeProjects.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Projects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {completedToday}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed Today
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {averageProgress.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average Progress
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Progress Overview" />
            <CardContent>
              <Box height={400}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeTracking; 