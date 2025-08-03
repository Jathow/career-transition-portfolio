import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh,
  Visibility,
  People,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import { PortfolioAnalytics as AnalyticsData } from '../../store/slices/portfolioSlice';

interface PortfolioAnalyticsProps {
  analytics: AnalyticsData | null;
  onFetchAnalytics: () => void;
  loading: boolean;
}

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  analytics,
  onFetchAnalytics,
  loading,
}) => {
  useEffect(() => {
    if (!analytics) {
      onFetchAnalytics();
    }
  }, [analytics, onFetchAnalytics]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTopPages = () => {
    if (!analytics?.pageViews) return [];
    return Object.entries(analytics.pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopReferrers = () => {
    if (!analytics?.referrers) return [];
    return Object.entries(analytics.referrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Analytics
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            No analytics data available. Make sure your portfolio is public and analytics are enabled.
          </Alert>
          <Button
            variant="contained"
            onClick={onFetchAnalytics}
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Portfolio Analytics</Typography>
        <Button
          variant="outlined"
          onClick={onFetchAnalytics}
          startIcon={<Refresh />}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Visibility color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" color="primary">
                {analytics.totalViews}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Views
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <People color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" color="primary">
                {analytics.uniqueVisitors}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Unique Visitors
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" color="primary">
                {analytics.totalViews > 0 ? Math.round((analytics.uniqueVisitors / analytics.totalViews) * 100) : 0}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Engagement Rate
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" color="primary">
                {Object.keys(analytics.pageViews).length}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Pages Viewed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Pages */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Pages
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Page</TableCell>
                      <TableCell align="right">Views</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getTopPages().map(([page, views]) => (
                      <TableRow key={page}>
                        <TableCell>
                          <Chip label={page} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {views}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Referrers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Referrers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Visits</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getTopReferrers().map(([referrer, visits]) => (
                      <TableRow key={referrer}>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {referrer}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {visits}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Views */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Views
              </Typography>
              {analytics.recentViews.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Page</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Referrer</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.recentViews.map((view) => (
                        <TableRow key={view.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(view.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={view.page} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {view.visitorIp || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                              {view.referrer || 'Direct'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No recent views to display
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PortfolioAnalytics; 