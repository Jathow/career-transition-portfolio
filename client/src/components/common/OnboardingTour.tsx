import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h3>Welcome to Career Portfolio! 👋</h3>
        <p>Let's take a quick tour of the key features to help you get started.</p>
        <p>This tour will show you the main sections and how to use them effectively.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>📊 Dashboard</h4>
        <p>Your main workspace where you can:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>View project statistics and progress</li>
          <li>Create new portfolio projects</li>
          <li>Track active and completed work</li>
          <li>See overdue items and deadlines</li>
        </ul>
        <p><strong>Tip:</strong> Set realistic deadlines and track your progress!</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>💼 Job Applications</h4>
        <p>Track your job search progress:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Add new job applications with company details</li>
          <li>Filter and search through your applications</li>
          <li>Track application status (Applied, Interview, Offer, etc.)</li>
          <li>Set follow-up reminders and notes</li>
          <li>Link specific resume versions to each application</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>🎯 Interview Management</h4>
        <p>Prepare for and track interviews:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Schedule interviews with companies</li>
          <li>Access preparation guides and question banks</li>
          <li>Record interview feedback and notes</li>
          <li>Track your performance and areas for improvement</li>
          <li>Analyze interview success patterns</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>📝 Resume Builder</h4>
        <p>Create professional resumes:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Build resumes with multiple professional templates</li>
          <li>Customize content for different job applications</li>
          <li>Export in various formats (PDF, Word, etc.)</li>
          <li>Track which resume version you used for each application</li>
          <li>Keep multiple versions for different job types</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>🌟 Portfolio Showcase</h4>
        <p>Showcase your work to employers:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Automatically display completed projects</li>
          <li>Customize portfolio themes and styling</li>
          <li>Make your portfolio public for recruiters</li>
          <li>Track portfolio views and analytics</li>
          <li>Generate professional portfolio content</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>📈 Progress Tracking</h4>
        <p>Stay motivated and track your journey:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Log daily activities and achievements</li>
          <li>Set and track career transition goals</li>
          <li>Monitor your motivation levels</li>
          <li>Celebrate milestones and progress</li>
          <li>Stay disciplined with regular check-ins</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>💰 Revenue & Market Analysis</h4>
        <p>Monetize your portfolio projects:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Track revenue potential of your projects</li>
          <li>Analyze market opportunities</li>
          <li>Plan monetization strategies</li>
          <li>Identify commercial potential</li>
          <li>Track project profitability</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h4>🔍 Global Features</h4>
        <p>Quick access to everything:</p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li><strong>Search:</strong> Use the search bar (or Ctrl+K) to find anything quickly</li>
          <li><strong>Notifications:</strong> Check the bell icon for updates and reminders</li>
          <li><strong>Navigation:</strong> Use the sidebar to switch between sections</li>
          <li><strong>Keyboard shortcuts:</strong> Ctrl+K for search, Ctrl+N for new items</li>
        </ul>
      </div>
    ),
    placement: 'center',
  },
  {
    target: 'body',
    content: (
      <div style={{ textAlign: 'left', height: '280px', overflowY: 'auto' }}>
        <h3>You're all set! 🎉</h3>
        <p>You now know the basics of Career Portfolio. Here's how to get started:</p>
        <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li><strong>Create your first project</strong> on the Dashboard</li>
          <li><strong>Add a job application</strong> to start tracking your search</li>
          <li><strong>Build your resume</strong> using the Resume Builder</li>
          <li><strong>Set up your portfolio</strong> to showcase your work</li>
        </ol>
        <p><strong>Remember:</strong> Focus on completing projects to build momentum and maintain discipline throughout your career transition!</p>
      </div>
    ),
    placement: 'center',
  },
];

const OnboardingTour: React.FC<{ isFirstTime?: boolean }> = ({ isFirstTime = false }) => {
  const [run, setRun] = useState(false);

  // Start tour for first-time users
  useEffect(() => {
    if (isFirstTime && !localStorage.getItem('onboarding-completed')) {
      setTimeout(() => setRun(true), 1000);
    }
  }, [isFirstTime]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action, index } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem('onboarding-completed', 'true');
    }
    
    // Handle the last step specifically
    if (action === 'next' && index === TOUR_STEPS.length - 1) {
      setRun(false);
      localStorage.setItem('onboarding-completed', 'true');
    }
  };

  const handleStart = () => {
    localStorage.removeItem('onboarding-completed');
    setRun(true);
  };

  return (
    <>
      <Joyride
        steps={TOUR_STEPS}
        run={run}
        callback={handleCallback}
        continuous
        hideCloseButton
        hideBackButton={false}
        scrollToFirstStep
        showProgress
        showSkipButton
        disableOverlayClose
        disableScrolling={false}
        spotlightClicks={false}
        styles={{
          options: {
            primaryColor: '#1976d2',
            zIndex: 10000,
          },
          tooltip: {
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            maxWidth: 500,
            padding: '24px',
          },
          tooltipTitle: {
            color: '#1976d2',
            fontWeight: 700,
            fontSize: '20px',
            marginBottom: '12px',
          },
          tooltipContent: {
            color: '#333',
            fontSize: '16px',
            lineHeight: 1.6,
          },
          buttonNext: {
            backgroundColor: '#1976d2',
            borderRadius: 8,
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            marginTop: '16px',
          },
          buttonBack: {
            color: '#666',
            marginRight: 16,
            fontSize: '16px',
            padding: '12px 24px',
          },
          buttonSkip: {
            color: '#999',
            fontSize: '14px',
            marginTop: '8px',
          },
          buttonClose: {
            display: 'none',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip tour',
        }}

      />

      {/* Quick start button */}
      {!run && (
        <button
          onClick={handleStart}
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 1000,
            padding: '12px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 25,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1565c0';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1976d2';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          🎯 Start Tour
        </button>
      )}
    </>
  );
};

export default OnboardingTour; 