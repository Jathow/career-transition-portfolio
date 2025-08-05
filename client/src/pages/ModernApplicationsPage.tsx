import React, { useEffect } from 'react';
import {
  Typography,
  Alert,
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
import SimpleTabs from '../components/common/SimpleTabs';

const ModernApplicationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applicationsNeedingFollowUp, error } = useAppSelector(
    (state) => state.jobApplications
  );

  useEffect(() => {
    dispatch(fetchApplicationsNeedingFollowUp());
  }, [dispatch]);

  const getFollowUpCount = () => {
    return applicationsNeedingFollowUp.length;
  };

  const tabs = [
    {
      id: 'applications',
      label: 'Applications',
      icon: <ListIcon />,
      content: <ApplicationList />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      content: <ApplicationAnalytics />
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: <NotificationsIcon />,
      count: getFollowUpCount(),
      content: <FollowUpReminders />
    }
  ];

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SimpleTabs tabs={tabs} defaultTab="applications" />
    </>
  );
};

export default ModernApplicationsPage;