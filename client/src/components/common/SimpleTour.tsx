import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const TOUR_STEPS = [
  {
    title: 'Welcome to Career Portfolio! 👋',
    content: 'This platform helps you manage your career transition with project tracking, job applications, and portfolio building.'
  },
  {
    title: 'Dashboard 📊',
    content: 'Your main workspace to view project statistics, create new projects, and track your progress.'
  },
  {
    title: 'Job Applications 💼',
    content: 'Track your job search progress, manage applications, and set follow-up reminders.'
  },
  {
    title: 'Interviews 🎯',
    content: 'Schedule interviews, access preparation guides, and track your performance.'
  },
  {
    title: 'Resume Builder 📝',
    content: 'Create professional resumes with multiple templates and export in various formats.'
  },
  {
    title: 'Portfolio Showcase 🌟',
    content: 'Display your completed projects with customizable themes for recruiters to view.'
  },
  {
    title: 'You\'re Ready! 🎉',
    content: 'Start by creating your first project, adding a job application, or building your resume. Good luck with your career transition!'
  }
];

interface SimpleTourProps {
  isFirstTime?: boolean;
}

const SimpleTour: React.FC<SimpleTourProps> = ({ isFirstTime = false }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isFirstTime && !localStorage.getItem('onboarding-completed')) {
      setTimeout(() => setOpen(true), 1000);
    }
  }, [isFirstTime]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('onboarding-completed', 'true');
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = () => {
    localStorage.removeItem('onboarding-completed');
    setCurrentStep(0);
    setOpen(true);
  };

  const currentStepData = TOUR_STEPS[currentStep];

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {currentStepData.title}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {TOUR_STEPS.map((_, index) => (
                <Step key={index}>
                  <StepLabel />
                </Step>
              ))}
            </Stepper>
          </Box>

          <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
            {currentStepData.content}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Skip Tour
          </Button>
          <Box sx={{ flex: 1 }} />
          {currentStep > 0 && (
            <Button onClick={handlePrevious} variant="outlined">
              Previous
            </Button>
          )}
          <Button onClick={handleNext} variant="contained">
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Tour Button */}
      {!open && (
        <Button
          onClick={handleStart}
          variant="contained"
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 1000,
            borderRadius: 25,
            px: 3,
            py: 1.5,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          🎯 Start Tour
        </Button>
      )}
    </>
  );
};

export default SimpleTour;