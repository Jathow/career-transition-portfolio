import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  MonetizationOn,
  Analytics,
  Assessment,
  Business,
  AttachMoney,
  People,
  Add,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  AccountBalance,
} from '@mui/icons-material';
import { api } from '../../services/api';
import RevenueMetricForm from './RevenueMetricForm';
import MonetizationStrategyForm from './MonetizationStrategyForm';

interface RevenueTrackingDashboardProps {
  projectId?: string;
}

const RevenueTrackingDashboard: React.FC<RevenueTrackingDashboardProps> = ({ projectId }) => {
  const [summary, setSummary] = useState<any>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<any[]>([]);
  const [monetizationStrategies, setMonetizationStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showStrategyForm, setShowStrategyForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (projectId) {
        // Fetch project-specific data
        const [metricsResponse, strategiesResponse] = await Promise.all([
          api.get(`/revenue-tracking/projects/${projectId}/revenue-metrics`),
          api.get(`/revenue-tracking/projects/${projectId}/monetization-strategies`),
        ]);
        setRevenueMetrics(metricsResponse.data.data || []);
        setMonetizationStrategies(strategiesResponse.data.data || []);
      } else {
        // Fetch user-wide data
        const [summaryResponse, metricsResponse, strategiesResponse] = await Promise.all([
          api.get('/revenue-tracking/revenue-tracking/summary'),
          api.get('/revenue-tracking/revenue-metrics'),
          api.get('/revenue-tracking/monetization-strategies'),
        ]);
        setSummary(summaryResponse.data.data);
        setRevenueMetrics(metricsResponse.data.data || []);
        setMonetizationStrategies(strategiesResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch revenue tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric);
    setMetricDialogOpen(true);
  };

  const handleStrategyClick = (strategy: any) => {
    setSelectedStrategy(strategy);
    setStrategyDialogOpen(true);
  };

  const handleMetricSuccess = () => {
    setShowMetricForm(false);
    fetchData();
  };

  const handleStrategySuccess = () => {
    setShowStrategyForm(false);
    fetchData();
  };

  const getMetricTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <AttachMoney />;
      case 'user_engagement': return <People />;
      case 'conversion': return <TrendingUp />;
      case 'retention': return <Assessment />;
      default: return <Analytics />;
    }
  };

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <AccountBalance />;
      case 'freemium': return <Business />;
      case 'ads': return <MonetizationOn />;
      case 'marketplace': return <Analytics />;
      case 'saas': return <TrendingUp />;
      default: return <MonetizationOn />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'IMPLEMENTING': return 'warning';
      case 'PLANNING': return 'info';
      case 'PAUSED': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatSummaryValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === 0) {
      return '—';
    }
    
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Revenue Tracking Dashboard
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.totalRevenue, 'currency')}
                    </Typography>
                  </Box>
                  <MonetizationOn color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Monthly Growth
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.monthlyGrowth, 'percentage')}
                    </Typography>
                  </Box>
                  <TrendingUp color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Strategies
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.activeStrategies, 'number')}
                    </Typography>
                  </Box>
                  <Business color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.averageConversionRate, 'percentage')}
                    </Typography>
                  </Box>
                  <Analytics color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Revenue Metrics */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Revenue Metrics
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowMetricForm(true)}
          >
            Add Metric
          </Button>
        </Box>

        {revenueMetrics.length === 0 ? (
          <Box textAlign="center" sx={{ py: 6 }}>
            <AttachMoney color="action" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No revenue metrics yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Start tracking your project's financial performance. Monitor revenue, user engagement, 
              conversion rates, and retention metrics to understand your project's success.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowMetricForm(true)}
              >
                Add First Metric
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={() => setShowMetricForm(true)}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        ) : (
          <List>
            {revenueMetrics.map((metric) => (
              <ListItem
                key={metric.id}
                button
                onClick={() => handleMetricClick(metric)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getMetricTypeIcon(metric.metricType)}
                </Box>
                <ListItemText
                  primary={metric.metricName}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {metric.value} {metric.unit} • {metric.period} • {new Date(metric.date).toLocaleDateString()}
                      </Typography>
                      {metric.notes && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {metric.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Monetization Strategies */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Monetization Strategies
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowStrategyForm(true)}
          >
            Add Strategy
          </Button>
        </Box>

        {monetizationStrategies.length === 0 ? (
          <Box textAlign="center" sx={{ py: 6 }}>
            <Lightbulb color="action" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No monetization strategies yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Plan and track different ways to monetize your project. Explore subscription models, 
              freemium approaches, advertising, marketplace fees, and SaaS pricing strategies.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowStrategyForm(true)}
              >
                Create First Strategy
              </Button>
              <Button
                variant="outlined"
                startIcon={<Business />}
                onClick={() => setShowStrategyForm(true)}
              >
                Explore Options
              </Button>
            </Stack>
          </Box>
        ) : (
          <List>
            {monetizationStrategies.map((strategy) => (
              <ListItem
                key={strategy.id}
                button
                onClick={() => handleStrategyClick(strategy)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getStrategyTypeIcon(strategy.strategyType)}
                </Box>
                <ListItemText
                  primary={strategy.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {strategy.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={strategy.status}
                          color={getStatusColor(strategy.status)}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip
                          label={strategy.priority}
                          color={getPriorityColor(strategy.priority)}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        {strategy.revenueProjection && (
                          <Chip
                            label={`$${strategy.revenueProjection.toLocaleString()}/month`}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Metric Form Dialog */}
      <Dialog
        open={showMetricForm}
        onClose={() => setShowMetricForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Revenue Metric</DialogTitle>
        <DialogContent>
          <RevenueMetricForm
            projectId={projectId || ''}
            onSuccess={handleMetricSuccess}
            onCancel={() => setShowMetricForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Strategy Form Dialog */}
      <Dialog
        open={showStrategyForm}
        onClose={() => setShowStrategyForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Monetization Strategy</DialogTitle>
        <DialogContent>
          <MonetizationStrategyForm
            projectId={projectId || ''}
            onSuccess={handleStrategySuccess}
            onCancel={() => setShowStrategyForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Metric Detail Dialog */}
      <Dialog
        open={metricDialogOpen}
        onClose={() => setMetricDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMetric && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getMetricTypeIcon(selectedMetric.metricType)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedMetric.metricName}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Value
                  </Typography>
                  <Typography variant="body1">
                    {selectedMetric.value} {selectedMetric.unit}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Period
                  </Typography>
                  <Typography variant="body1">
                    {selectedMetric.period}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedMetric.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedMetric.metricType.replace('_', ' ')}
                  </Typography>
                </Grid>
                {selectedMetric.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedMetric.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMetricDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Strategy Detail Dialog */}
      <Dialog
        open={strategyDialogOpen}
        onClose={() => setStrategyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedStrategy && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getStrategyTypeIcon(selectedStrategy.strategyType)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedStrategy.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedStrategy.description}
                  </Typography>
                </Grid>

                {selectedStrategy.targetAudience && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Target Audience
                    </Typography>
                    <Typography variant="body1">
                      {selectedStrategy.targetAudience}
                    </Typography>
                  </Grid>
                )}

                {selectedStrategy.pricingModel && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Pricing Model
                    </Typography>
                    <Typography variant="body1">
                      {selectedStrategy.pricingModel}
                    </Typography>
                  </Grid>
                )}

                {selectedStrategy.revenueProjection && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Revenue Projection
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(selectedStrategy.revenueProjection)}/month
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedStrategy.status}
                    color={getStatusColor(selectedStrategy.status)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedStrategy.priority}
                    color={getPriorityColor(selectedStrategy.priority)}
                  />
                </Grid>

                {selectedStrategy.implementationPlan && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Implementation Plan
                    </Typography>
                    <Typography variant="body1">
                      {selectedStrategy.implementationPlan}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStrategyDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RevenueTrackingDashboard; 