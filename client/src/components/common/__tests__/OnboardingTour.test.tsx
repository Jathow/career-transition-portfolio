import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import OnboardingTour from '../OnboardingTour';

// Mock useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}));

// Mock react-joyride
jest.mock('react-joyride', () => {
  const STATUS = {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
  };

  return {
    __esModule: true,
    default: function MockJoyride({ callback, steps, run }: any) {
      if (run && callback) {
        // Simulate tour completion
        setTimeout(() => {
          callback({
            index: 0,
            status: STATUS.FINISHED,
            type: 'tour:end'
          });
        }, 100);
      }

      return run ? <div data-testid="joyride-tour" /> : null;
    },
    STATUS,
  };
});

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('OnboardingTour', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders without crashing', () => {
    renderWithProviders(<OnboardingTour />);
    expect(screen.queryByTestId('joyride-tour')).not.toBeInTheDocument();
  });

  it('shows quick tour button when not running', () => {
    renderWithProviders(<OnboardingTour />);
    const tourButton = screen.getByText('🎯 Quick Tour');
    expect(tourButton).toBeInTheDocument();
  });

  it('starts tour when quick tour button is clicked', async () => {
    renderWithProviders(<OnboardingTour />);
    const tourButton = screen.getByText('🎯 Quick Tour');
    
    fireEvent.click(tourButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('joyride-tour')).toBeInTheDocument();
    });
  });

  it('does not show quick tour button when tour is running', async () => {
    renderWithProviders(<OnboardingTour isFirstTime={true} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('joyride-tour')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('🎯 Quick Tour')).not.toBeInTheDocument();
  });

  it('marks onboarding as completed after tour finishes', async () => {
    renderWithProviders(<OnboardingTour isFirstTime={true} />);
    
    await waitFor(() => {
      expect(localStorage.getItem('onboarding-completed')).toBe('true');
    });
  });

  it('does not start tour if onboarding is already completed', () => {
    localStorage.setItem('onboarding-completed', 'true');
    renderWithProviders(<OnboardingTour isFirstTime={true} />);
    
    expect(screen.queryByTestId('joyride-tour')).not.toBeInTheDocument();
  });

  it('clears completion status when restarting tour', async () => {
    localStorage.setItem('onboarding-completed', 'true');
    renderWithProviders(<OnboardingTour />);
    
    const tourButton = screen.getByText('🎯 Quick Tour');
    fireEvent.click(tourButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('onboarding-completed')).toBeNull();
    });
  });
}); 