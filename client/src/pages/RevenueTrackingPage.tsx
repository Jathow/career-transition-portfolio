import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
} from '@mui/material';
import MarketAnalysisDashboard from '../components/marketAnalysis/MarketAnalysisDashboard';
import RevenueTrackingDashboard from '../components/revenueTracking/RevenueTrackingDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`revenue-tabpanel-${index}`}
      aria-labelledby={`revenue-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `revenue-tab-${index}`,
    'aria-controls': `revenue-tabpanel-${index}`,
  };
}

const RevenueTrackingPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Revenue Tracking & Market Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track revenue, analyze markets, and plan monetization strategies
        </Typography>

        <Paper elevation={2} data-tour="revenue-tracking">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="revenue tracking tabs"
              variant="fullWidth"
            >
              <Tab label="Market Analysis" {...a11yProps(0)} />
              <Tab label="Revenue Tracking" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <MarketAnalysisDashboard />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <RevenueTrackingDashboard />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default RevenueTrackingPage; 