import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Chip,
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

const GridApplicationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applicationsNeedingFollowUp, error } = useAppSelector(
    (state) => state.jobApplications
  );

  const [activeView, setActiveView] = useState<'applications' | 'analytics' | 'followups'>('applications');

  useEffect(() => {
    dispatch(fetchApplicationsNeedingFollowUp());
  }, [dispatch]);

  const getFollowUpCount = () => {
    return applicationsNeedingFollowUp.length;
  };

  const renderContent = () => {
    switch (activeView) {
      case 'applications':
        return <ApplicationList />;
      case 'analytics':
        return <ApplicationAnalytics />;
      case 'followups':
        return <FollowUpReminders />;
      default:
        return <ApplicationList />;
    }
  };

  const tabs = [
    {
      id: 'applications',
      label: 'Applications',
      icon: <ListIcon />,
      count: null
    },
    {
      id: 'analytics',
      label: 'Analytics', 
      icon: <AnalyticsIcon />,
      count: null
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: <NotificationsIcon />,
      count: getFollowUpCount()
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid-based Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              '& .MuiButton-root': {
                height: 64,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                textTransform: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                position: 'relative'
              }
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                variant={activeView === tab.id ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: activeView === tab.id ? 'primary.main' : 'transparent',
                  color: activeView === tab.id ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeView === tab.id ? 'primary.dark' : 'action.hover',
                  }
                }}
              >
                {tab.icon}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {tab.label}
                  {tab.count && tab.count > 0 && (
                    <Chip
                      label={tab.count}
                      size="small"
                      color="error"
                      sx={{
                        height: 18,
                        fontSize: '0.7rem',
                        '& .MuiChip-label': {
                          px: 0.5
                        }
                      }}
                    />
                  )}
                </Box>
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      <Box>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default GridApplicationsPage;