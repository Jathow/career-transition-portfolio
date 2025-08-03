import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppThemeProvider } from '../../../contexts/ThemeContext';
import BrandedLogo from '../BrandedLogo';
import BrandedButton from '../BrandedButton';
import BrandedCard from '../BrandedCard';
import BrandedLanding from '../BrandedLanding';
import BrandedEmailTemplate from '../BrandedEmailTemplate';
import { brandConfig } from '../../../config/brand';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: {
      isAuthenticated: false,
      user: null,
      isLoading: false,
    },
  },
});

// Test wrapper with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </BrowserRouter>
  </Provider>
);

describe('BrandedLogo', () => {
  it('renders full logo variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedLogo variant="full" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Career Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Build Your Future, One Project at a Time')).toBeInTheDocument();
  });

  it('renders compact logo variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedLogo variant="compact" />
      </TestWrapper>
    );
    
    expect(screen.getByText('CP')).toBeInTheDocument();
  });

  it('renders icon only variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedLogo variant="icon" />
      </TestWrapper>
    );
    
    // Should not have text content
    expect(screen.queryByText('Career Portfolio')).not.toBeInTheDocument();
    expect(screen.queryByText('CP')).not.toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper>
        <BrandedLogo onClick={handleClick} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Career Portfolio'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <BrandedLogo size="small" />
      </TestWrapper>
    );
    
    // Test different sizes
    rerender(
      <TestWrapper>
        <BrandedLogo size="large" />
      </TestWrapper>
    );
    
    // Component should render without errors
    expect(screen.getByText('Career Portfolio')).toBeInTheDocument();
  });
});

describe('BrandedButton', () => {
  it('renders primary variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton variant="primary">Test Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders secondary variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton variant="secondary">Secondary Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Secondary Button')).toBeInTheDocument();
  });

  it('renders outline variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton variant="outline">Outline Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Outline Button')).toBeInTheDocument();
  });

  it('renders ghost variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton variant="ghost">Ghost Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Ghost Button')).toBeInTheDocument();
  });

  it('renders danger variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton variant="danger">Delete</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper>
        <BrandedButton onClick={handleClick}>Click Me</BrandedButton>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(
      <TestWrapper>
        <BrandedButton loading>Loading Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading Button')).toBeInTheDocument();
    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <BrandedButton size="small">Small Button</BrandedButton>
      </TestWrapper>
    );
    
    rerender(
      <TestWrapper>
        <BrandedButton size="large">Large Button</BrandedButton>
      </TestWrapper>
    );
    
    expect(screen.getByText('Large Button')).toBeInTheDocument();
  });
});

describe('BrandedCard', () => {
  it('renders default variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedCard>Card Content</BrandedCard>
      </TestWrapper>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(
      <TestWrapper>
        <BrandedCard title="Test Title" subtitle="Test Subtitle">
          Card Content
        </BrandedCard>
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders elevated variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedCard variant="elevated">Elevated Card</BrandedCard>
      </TestWrapper>
    );
    
    expect(screen.getByText('Elevated Card')).toBeInTheDocument();
  });

  it('renders outlined variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedCard variant="outlined">Outlined Card</BrandedCard>
      </TestWrapper>
    );
    
    expect(screen.getByText('Outlined Card')).toBeInTheDocument();
  });

  it('renders gradient variant correctly', () => {
    render(
      <TestWrapper>
        <BrandedCard variant="gradient">Gradient Card</BrandedCard>
      </TestWrapper>
    );
    
    expect(screen.getByText('Gradient Card')).toBeInTheDocument();
  });
});

describe('BrandedLanding', () => {
  it('renders landing page correctly', () => {
    render(
      <TestWrapper>
        <BrandedLanding />
      </TestWrapper>
    );
    
    // Check for main sections
    expect(screen.getByText('Build Your Future,')).toBeInTheDocument();
    expect(screen.getByText('One Project at a Time')).toBeInTheDocument();
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('displays feature cards correctly', () => {
    render(
      <TestWrapper>
        <BrandedLanding />
      </TestWrapper>
    );
    
    // Check for feature titles
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Resume Builder')).toBeInTheDocument();
    expect(screen.getByText('Application Tracking')).toBeInTheDocument();
    expect(screen.getByText('Interview Prep')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Showcase')).toBeInTheDocument();
    expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
  });

  it('displays statistics correctly', () => {
    render(
      <TestWrapper>
        <BrandedLanding />
      </TestWrapper>
    );
    
    // Check for stats
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('200+')).toBeInTheDocument();
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    render(
      <TestWrapper>
        <BrandedLanding />
      </TestWrapper>
    );
    
    const getStartedButton = screen.getByText('Get Started Free');
    const signInButton = screen.getByText('Sign In');
    
    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });
});

describe('BrandedEmailTemplate', () => {
  it('renders email template correctly', () => {
    render(
      <TestWrapper>
        <BrandedEmailTemplate title="Test Email" subtitle="Test Subtitle">
          <p>Email content</p>
        </BrandedEmailTemplate>
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Email')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Email content')).toBeInTheDocument();
  });

  it('renders with CTA button when provided', () => {
    render(
      <TestWrapper>
        <BrandedEmailTemplate 
          title="Test Email" 
          ctaText="Click Here" 
          ctaLink="/test"
        >
          <p>Email content</p>
        </BrandedEmailTemplate>
      </TestWrapper>
    );
    
    expect(screen.getByText('Click Here')).toBeInTheDocument();
  });

  it('renders welcome email template correctly', () => {
    render(
      <TestWrapper>
        <BrandedEmailTemplate.WelcomeEmailTemplate userName="John Doe" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Welcome to Career Portfolio!')).toBeInTheDocument();
    expect(screen.getByText('Hi John Doe,')).toBeInTheDocument();
  });

  it('renders project reminder email template correctly', () => {
    render(
      <TestWrapper>
        <BrandedEmailTemplate.ProjectReminderEmailTemplate 
          userName="John Doe"
          projectName="Test Project"
          daysRemaining={3}
          projectLink="/projects/1"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Project Deadline Reminder')).toBeInTheDocument();
    expect(screen.getByText('Your project "Test Project" is due soon')).toBeInTheDocument();
    expect(screen.getByText('Hi John Doe,')).toBeInTheDocument();
  });

  it('renders interview reminder email template correctly', () => {
    render(
      <TestWrapper>
        <BrandedEmailTemplate.InterviewReminderEmailTemplate 
          userName="John Doe"
          companyName="Tech Corp"
          position="Software Engineer"
          interviewDate="2024-01-15"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Upcoming Interview Reminder')).toBeInTheDocument();
    expect(screen.getByText('Interview with Tech Corp for Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Hi John Doe,')).toBeInTheDocument();
  });
});

describe('Brand Configuration', () => {
  it('has correct brand colors', () => {
    expect(brandConfig.colors.primary.main).toBe('#2563eb');
    expect(brandConfig.colors.secondary.main).toBe('#7c3aed');
    expect(brandConfig.colors.success.main).toBe('#10b981');
    expect(brandConfig.colors.error.main).toBe('#ef4444');
  });

  it('has correct typography configuration', () => {
    expect(brandConfig.typography.fontFamily.primary).toContain('Inter');
    expect(brandConfig.typography.fontFamily.secondary).toContain('Poppins');
    expect(brandConfig.typography.fontWeight.bold).toBe(700);
    expect(brandConfig.typography.fontWeight.regular).toBe(400);
  });

  it('has correct spacing configuration', () => {
    expect(brandConfig.spacing.xs).toBe(4);
    expect(brandConfig.spacing.md).toBe(16);
    expect(brandConfig.spacing.lg).toBe(24);
  });

  it('has correct brand identity', () => {
    expect(brandConfig.name).toBe('Career Portfolio');
    expect(brandConfig.tagline).toBe('Build Your Future, One Project at a Time');
  });
}); 