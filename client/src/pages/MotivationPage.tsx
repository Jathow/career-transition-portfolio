import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MotivationDashboard from '../components/motivation/MotivationDashboard';

const MotivationPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Typography variant="h3" gutterBottom>
          Motivation & Progress
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track your daily activities, set goals, and stay motivated throughout your career transition journey.
        </Typography>
        <div data-tour="progress-tracking">
          <MotivationDashboard />
        </div>
      </Box>
    </Container>
  );
};

export default MotivationPage; 