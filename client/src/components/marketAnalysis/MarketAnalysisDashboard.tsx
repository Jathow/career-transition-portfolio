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
  Business,
  Assessment,
  MonetizationOn,
  Analytics,
  Add,
  Lightbulb,
  Search,
} from '@mui/icons-material';
import { api } from '../../services/api';
import MarketResearchForm from './MarketResearchForm';

interface MarketAnalysisDashboardProps {
  projectId?: string;
}

const MarketAnalysisDashboard: React.FC<MarketAnalysisDashboardProps> = ({ projectId }) => {
  const [summary, setSummary] = useState<any>(null);
  const [marketResearch, setMarketResearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResearch, setSelectedResearch] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (projectId) {
        // Fetch project-specific data
        const [researchResponse] = await Promise.all([
          api.get(`/market-analysis/projects/${projectId}/market-research`),
        ]);
        setMarketResearch(researchResponse.data.data || []);
      } else {
        // Fetch user-wide data
        const [summaryResponse, researchResponse] = await Promise.all([
          api.get('/market-analysis/market-analysis/summary'),
          api.get('/market-analysis/market-research'),
        ]);
        setSummary(summaryResponse.data.data);
        setMarketResearch(researchResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch market analysis data');
    } finally {
      setLoading(false);
    }
  };

  const handleResearchClick = (research: any) => {
    setSelectedResearch(research);
    setDialogOpen(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchData();
  };

  const getCompetitionLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getMonetizationPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const getResearchTypeIcon = (type: string) => {
    switch (type) {
      case 'market_analysis': return <Business />;
      case 'competition_analysis': return <Assessment />;
      case 'opportunity_assessment': return <TrendingUp />;
      default: return <Analytics />;
    }
  };

  const formatSummaryValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === 0) {
      return '—';
    }
    
    switch (type) {
      case 'currency':
        return `$${value.toLocaleString()}`;
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
        Market Analysis Dashboard
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
                      Total Research
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.totalResearch, 'number')}
                    </Typography>
                  </Box>
                  <Analytics color="primary" />
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
                      High Potential Projects
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.highPotentialProjects, 'number')}
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
                      Avg Competition
                    </Typography>
                    <Typography variant="h4">
                      {summary.averageCompetitionLevel || '—'}
                    </Typography>
                  </Box>
                  <Assessment color="warning" />
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
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      {formatSummaryValue(summary.revenueMetrics?.totalRevenue, 'currency')}
                    </Typography>
                  </Box>
                  <MonetizationOn color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Market Research List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Market Research
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddForm(true)}
          >
            Add Research
          </Button>
        </Box>

        {marketResearch.length === 0 ? (
          <Box textAlign="center" sx={{ py: 6 }}>
            <Lightbulb color="action" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No market research yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Start by analyzing your project's market potential. Research your target audience, 
              understand the competition, and assess monetization opportunities.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
              >
                Create First Research
              </Button>
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={() => setShowAddForm(true)}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        ) : (
          <List>
            {marketResearch.map((research) => (
              <ListItem
                key={research.id}
                button
                onClick={() => handleResearchClick(research)}
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
                  {getResearchTypeIcon(research.researchType)}
                </Box>
                <ListItemText
                  primary={research.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {research.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {research.targetMarket && (
                          <Chip
                            label={`Target: ${research.targetMarket}`}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        {research.competitionLevel && (
                          <Chip
                            label={`Competition: ${research.competitionLevel}`}
                            color={getCompetitionLevelColor(research.competitionLevel)}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        {research.monetizationPotential && (
                          <Chip
                            label={`Potential: ${research.monetizationPotential}`}
                            color={getMonetizationPotentialColor(research.monetizationPotential)}
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

      {/* Add Research Form Dialog */}
      <Dialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Market Research</DialogTitle>
        <DialogContent>
          <MarketResearchForm
            projectId={projectId || ''}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Research Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedResearch && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {getResearchTypeIcon(selectedResearch.researchType)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedResearch.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedResearch.description}
                  </Typography>
                </Grid>

                {selectedResearch.targetMarket && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Target Market
                    </Typography>
                    <Typography variant="body1">
                      {selectedResearch.targetMarket}
                    </Typography>
                  </Grid>
                )}

                {selectedResearch.marketSize && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Market Size
                    </Typography>
                    <Typography variant="body1">
                      {selectedResearch.marketSize}
                    </Typography>
                  </Grid>
                )}

                {selectedResearch.competitionLevel && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Competition Level
                    </Typography>
                    <Chip
                      label={selectedResearch.competitionLevel}
                      color={getCompetitionLevelColor(selectedResearch.competitionLevel)}
                    />
                  </Grid>
                )}

                {selectedResearch.monetizationPotential && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Monetization Potential
                    </Typography>
                    <Chip
                      label={selectedResearch.monetizationPotential}
                      color={getMonetizationPotentialColor(selectedResearch.monetizationPotential)}
                    />
                  </Grid>
                )}

                {selectedResearch.insights && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Key Insights
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedResearch.insights}
                    </Typography>
                  </Grid>
                )}

                {selectedResearch.recommendations && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Recommendations
                    </Typography>
                    <Typography variant="body1">
                      {selectedResearch.recommendations}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MarketAnalysisDashboard; 