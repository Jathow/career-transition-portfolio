import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchDailyLogs } from '../../store/slices/motivationSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgressChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dailyLogs, loading } = useAppSelector((state) => state.motivation);

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;

    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    dispatch(fetchDailyLogs({ startDate, endDate }));
  }, [dispatch, timeRange]);

  const prepareChartData = () => {
    if (!dailyLogs || dailyLogs.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort logs by date
    const sortedLogs = [...dailyLogs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedLogs.map(log => {
      const date = new Date(log.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const codingHours = sortedLogs.map(log => log.codingMinutes / 60);
    const applications = sortedLogs.map(log => log.applicationsSubmitted);
    const learningHours = sortedLogs.map(log => log.learningMinutes / 60);

    return {
      labels,
      datasets: [
        {
          label: 'Coding Hours',
          data: codingHours,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Applications',
          data: applications,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          fill: false,
        },
        {
          label: 'Learning Hours',
          data: learningHours,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
          fill: false,
        },
      ],
    };
  };

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Progress Overview',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (label.includes('Hours')) {
              return `${label}: ${value.toFixed(1)} hours`;
            } else if (label === 'Applications') {
              return `${label}: ${value} applications`;
            }
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const chartData = prepareChartData();

  const calculateAverages = () => {
    if (!dailyLogs || dailyLogs.length === 0) {
      return { coding: 0, applications: 0, learning: 0 };
    }

    const totalCoding = dailyLogs.reduce((sum, log) => sum + log.codingMinutes, 0) / 60;
    const totalApplications = dailyLogs.reduce((sum, log) => sum + log.applicationsSubmitted, 0);
    const totalLearning = dailyLogs.reduce((sum, log) => sum + log.learningMinutes, 0) / 60;

    const daysCount = dailyLogs.length;

    return {
      coding: totalCoding / daysCount,
      applications: totalApplications / daysCount,
      learning: totalLearning / daysCount,
    };
  };

  const averages = calculateAverages();

  return (
    <Box>
      {/* Controls */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
              label="Chart Type"
            >
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Averages Summary */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {averages.coding.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Avg. Coding Hours/Day
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {averages.applications.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Avg. Applications/Day
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {averages.learning.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Avg. Learning Hours/Day
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart */}
      <Box sx={{ height: 400, position: 'relative' }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography>Loading chart data...</Typography>
          </Box>
        ) : !dailyLogs || dailyLogs.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography color="textSecondary">
              No data available for the selected time range. Start logging your daily activities!
            </Typography>
          </Box>
        ) : (
          <>
            {chartType === 'line' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </>
        )}
      </Box>

      {/* Chart Legend */}
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          <strong>Coding Hours:</strong> Time spent on portfolio projects and coding practice
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Applications:</strong> Number of job applications submitted
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Learning Hours:</strong> Time spent learning new skills and technologies
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgressChart; 