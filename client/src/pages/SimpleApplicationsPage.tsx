import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  ButtonGroup,
  Button,
  Badge,
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

const SimpleApplicationsPage: React.FC = () => {
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

      {/* Simple Button Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <ButtonGroup 
            variant="outlined" 
            sx={{ 
              display: 'flex',
              height: 64,
              '& .MuiButton-root': {
                flex: 1,
                height: '100%',
                py: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                textTransform: 'none',
                fontSize: '0.875rem'
              }
            }}
          >
            <Button
              onClick={() => setActiveView('applications')}
              variant={activeView === 'applications' ? 'contained' : 'outlined'}
              startIcon={<ListIcon />}
            >
              Applications
            </Button>
            
            <Button
              onClick={() => setActiveView('analytics')}
              variant={activeView === 'analytics' ? 'contained' : 'outlined'}
              startIcon={<AnalyticsIcon />}
            >
              Analytics
            </Button>
            
            <Button
              onClick={() => setActiveView('followups')}
              variant={activeView === 'followups' ? 'contained' : 'outlined'}
              startIcon={<NotificationsIcon />}
            >
              Follow-ups {getFollowUpCount() > 0 && `(${getFollowUpCount()})`}
            </Button>
          </ButtonGroup>
        </CardContent>
      </Card>

      {/* Content */}
      <Box sx={{ py: 2 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default SimpleApplicationsPage;