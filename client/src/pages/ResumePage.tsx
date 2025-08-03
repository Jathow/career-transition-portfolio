import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import ResumeList from '../components/resumes/ResumeList';
import ResumeBuilder from '../components/resumes/ResumeBuilder';
import { Resume } from '../store/slices/resumeSlice';

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
      id={`resume-tabpanel-${index}`}
      aria-labelledby={`resume-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ResumePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume);
    setTabValue(1); // Switch to builder tab
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Resume Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, edit, and manage your professional resumes for different job applications
        </Typography>
      </Box>

      <Paper elevation={2} data-tour="resume-builder">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="resume management tabs"
          >
            <Tab
              icon={<DescriptionIcon />}
              label="My Resumes"
              id="resume-tab-0"
              aria-controls="resume-tabpanel-0"
            />
            <Tab
              icon={<BuildIcon />}
              label="Resume Builder"
              id="resume-tab-1"
              aria-controls="resume-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ResumeList onResumeSelect={handleResumeSelect} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ResumeBuilder 
            resume={selectedResume || undefined}
            onSave={(resume) => {
              setSelectedResume(resume);
              setTabValue(0); // Switch back to list tab
            }}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ResumePage; 