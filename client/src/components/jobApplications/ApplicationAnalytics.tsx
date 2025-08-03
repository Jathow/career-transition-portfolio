import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { fetchApplicationAnalytics } from '../../store/slices/jobApplicationSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ApplicationAnalytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { analytics, loading, error } = useAppSelector((state) => state.jobApplications);

  useEffect(() => {
    dispatch(fetchApplicationAnalytics());
  }, [dispatch]);

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

  if (!analytics) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No analytics data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start creating job applications to see your analytics
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const statusData = {
    labels: Object.keys(analytics.applicationsByStatus).map(status => {
      const statusMap: Record<string, string> = {
        'APPLIED': 'Applied',
        'SCREENING': 'Screening',
        'INTERVIEW': 'Interview',
        'OFFER': 'Offer',
        'REJECTED': 'Rejected',
        'WITHDRAWN': 'Withdrawn'
      };
      return statusMap[status] || status;
    }),
    datasets: [
      {
        label: 'Applications',
        data: Object.values(analytics.applicationsByStatus),
        backgroundColor: [
          '#2196F3', // Applied
          '#00BCD4', // Screening
          '#FF9800', // Interview
          '#4CAF50', // Offer
          '#F44336', // Rejected
          '#9E9E9E'  // Withdrawn
        ],
        borderWidth: 1
      }
    ]
  };

  const monthlyData = {
    labels: Object.keys(analytics.applicationsByMonth).map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Applications per Month',
        data: Object.values(analytics.applicationsByMonth),
        backgroundColor: '#1976D2',
        borderColor: '#1976D2',
        borderWidth: 1
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <ScheduleIcon />;
      case 'SCREENING':
        return <AssessmentIcon />;
      case 'INTERVIEW':
        return <WorkIcon />;
      case 'OFFER':
        return <CheckCircleIcon />;
      case 'REJECTED':
        return <CancelIcon />;
      case 'WITHDRAWN':
        return <CancelIcon />;
      default:
        return <WorkIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'primary';
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Application Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                {analytics.totalApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" gutterBottom>
                {analytics.successRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main" gutterBottom>
                {analytics.averageTimeToResponse}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Response Time (days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {analytics.topCompanies.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Companies Applied To
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Applications by Status
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Applications by Month
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Breakdown
              </Typography>
              <List>
                {Object.entries(analytics.applicationsByStatus).map(([status, count], index) => (
                  <React.Fragment key={status}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {status === 'APPLIED' ? 'Applied' :
                               status === 'SCREENING' ? 'Screening' :
                               status === 'INTERVIEW' ? 'Interview' :
                               status === 'OFFER' ? 'Offer' :
                               status === 'REJECTED' ? 'Rejected' :
                               status === 'WITHDRAWN' ? 'Withdrawn' : status}
                            </Typography>
                            <Chip
                              label={count}
                              color={getStatusColor(status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={`${((count / analytics.totalApplications) * 100).toFixed(1)}% of total`}
                      />
                    </ListItem>
                    {index < Object.entries(analytics.applicationsByStatus).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Companies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Companies
              </Typography>
              <List>
                {analytics.topCompanies.map((company, index) => (
                  <React.Fragment key={company.companyName}>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {company.companyName}
                            </Typography>
                            <Chip
                              label={company.count}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} most applied to`}
                      />
                    </ListItem>
                    {index < analytics.topCompanies.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insights */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Insights & Recommendations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Application Volume
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You've submitted {analytics.totalApplications} applications. 
                    {analytics.totalApplications < 10 && ' Consider increasing your application volume to improve your chances.'}
                    {analytics.totalApplications >= 10 && analytics.totalApplications < 25 && ' Good application volume. Focus on quality and follow-ups.'}
                    {analytics.totalApplications >= 25 && ' Excellent application volume. Focus on interview preparation and networking.'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <AssessmentIcon color="info" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Response Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average response time: {analytics.averageTimeToResponse} days.
                    {analytics.averageTimeToResponse > 7 && ' Consider following up after 1 week.'}
                    {analytics.averageTimeToResponse <= 7 && ' Good response time. Keep up the momentum!'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your success rate is {analytics.successRate}%.
                    {analytics.successRate < 5 && ' Focus on improving your resume and application quality.'}
                    {analytics.successRate >= 5 && analytics.successRate < 15 && ' Good success rate. Consider networking and interview practice.'}
                    {analytics.successRate >= 15 && ' Excellent success rate! You\'re on the right track.'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <TimelineIcon color="warning" />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Company Diversity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You've applied to {analytics.topCompanies.length} different companies.
                    {analytics.topCompanies.length < 5 && ' Consider diversifying your target companies.'}
                    {analytics.topCompanies.length >= 5 && ' Good company diversity. Focus on your top choices.'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationAnalytics; 