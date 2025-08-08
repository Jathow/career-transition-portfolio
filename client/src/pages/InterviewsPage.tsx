import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert
} from '@mui/material';
import {
  List as ListIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import InterviewList from '../components/interviews/InterviewList';
import InterviewAnalytics from '../components/interviews/InterviewAnalytics';
import InterviewPreparation from '../components/interviews/InterviewPreparation';
import InterviewFeedback from '../components/interviews/InterviewFeedback';

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
      id={`interview-tabpanel-${index}`}
      aria-labelledby={`interview-tab-${index}`}
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
    id: `interview-tab-${index}`,
    'aria-controls': `interview-tabpanel-${index}`,
  };
}

const InterviewsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInterviewSelect = (interview: any) => {
    setSelectedInterview(interview);
    setTabValue(3); // Switch to feedback tab
  };

  const handleFeedbackUpdate = (updatedInterview: any) => {
    setSelectedInterview(updatedInterview);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 3, pb: 2 }}>
        <Typography variant="h6" component="h1">
          Interview Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Schedule interviews, track preparation, and analyze performance
        </Typography>

        <Paper sx={{ width: '100%' }} data-tour="interview-schedule">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="interview management tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<ListIcon />} 
                label="All Interviews" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<AssessmentIcon />} 
                label="Analytics" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<SchoolIcon />} 
                label="Preparation" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={<FeedbackIcon />} 
                label="Feedback" 
                {...a11yProps(3)} 
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <InterviewList onInterviewSelect={handleInterviewSelect} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <InterviewAnalytics />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {selectedInterview ? (
              <InterviewPreparation 
                companyName={selectedInterview.application.companyName}
                _jobTitle={selectedInterview.application.jobTitle}
                _interviewType={selectedInterview.interviewType}
              />
            ) : (
              <Alert severity="info">
                Select an interview from the "All Interviews" tab to view preparation materials.
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {selectedInterview ? (
              <InterviewFeedback 
                interview={selectedInterview}
                onFeedbackUpdate={handleFeedbackUpdate}
              />
            ) : (
              <Alert severity="info">
                Select an interview from the "All Interviews" tab to view and edit feedback.
              </Alert>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default InterviewsPage; 