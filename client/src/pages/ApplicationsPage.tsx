import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  List as ListIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/store';
import { fetchApplicationsNeedingFollowUp } from '../store/slices/jobApplicationSlice';
import ApplicationList from '../components/jobApplications/ApplicationList';
import ApplicationAnalytics from '../components/jobApplications/ApplicationAnalytics';
import FollowUpReminders from '../components/jobApplications/FollowUpReminders';

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
      id={`applications-tabpanel-${index}`}
      aria-labelledby={`applications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `applications-tab-${index}`,
    'aria-controls': `applications-tabpanel-${index}`,
  };
}

const ApplicationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applicationsNeedingFollowUp, error } = useAppSelector(
    (state) => state.jobApplications
  );

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(fetchApplicationsNeedingFollowUp());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFollowUpCount = () => {
    return applicationsNeedingFollowUp.length;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h1">
          Job Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track applications, view analytics, and manage follow-ups
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="applications tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
                height: 48,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5
              }
            }}
          >
            <Tab
              icon={<ListIcon />}
              label="Applications"
              {...a11yProps(0)}
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Analytics"
              {...a11yProps(1)}
            />
            <Tab
              icon={<NotificationsIcon />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Follow-ups
                  {getFollowUpCount() > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getFollowUpCount()}
                    </Box>
                  )}
                </Box>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tabValue} index={0}>
        <ApplicationList />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ApplicationAnalytics />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <FollowUpReminders />
      </TabPanel>
    </Box>
  );
};

export default ApplicationsPage; 