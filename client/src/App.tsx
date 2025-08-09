import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Container } from '@mui/material';
import { RootState, AppDispatch } from './store/store';
import { checkAuthStatus } from './store/slices/authSlice';
import { fetchFlags } from './store/slices/flagsSlice';
import { useTheme } from './contexts/ThemeContext';
import ModernLayout from './components/layout/ModernLayout';
import SimpleTour from './components/common/SimpleTour';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';
import CommandPalette, { openCommandPalette } from './components/common/CommandPalette';
// Removed export dialog feature
import LoadingSpinner from './components/common/LoadingSpinner';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import BrandedLanding from './components/common/BrandedLanding';
import ToastProvider from './components/common/ToastProvider';
import FeedbackWidget from './components/common/FeedbackWidget';

// Lazy load pages for code splitting (add webpack prefetch hints for common routes)
const LoginPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/DashboardPage'));
const ProfilePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/ProfilePage'));
const SettingsPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/SettingsPage'));
const ResumePage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/ResumePage'));
const ApplicationsPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/ModernApplicationsPage'));
const InterviewsPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/InterviewsPage'));
const PortfolioPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/PortfolioPage'));
const MotivationPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/MotivationPage'));
const RevenueTrackingPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/RevenueTrackingPage'));
const PricingPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/PricingPage'));
const AdminPage = React.lazy(() => import(/* webpackPrefetch: true */ './pages/AdminPage'));
// Templates page removed

// Loading fallback component for Suspense
const PageLoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <LoadingSpinner />
  </Box>
);

function App() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const flags = useSelector((state: RootState) => state.flags);
  const { compactMode } = useTheme();
  // Removed export dialog state
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(fetchFlags());

    // Debug: Log app version to verify deployment
    console.log('🚀 App loaded - Build timestamp:', new Date().toISOString());
  }, [dispatch]);

  // Privacy-friendly page_view analytics (config-gated on server)
  useEffect(() => {
    import('./services/api').then(({ analyticsAPI }) => {
      analyticsAPI.ingest('page_view', window.location.pathname).catch(() => {});
    });
  }, [location.pathname]);

  useEffect(() => {
    // Check if this is a first-time user
    if (isAuthenticated && user) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding-completed') === 'true';
      const isNewUser = !hasCompletedOnboarding && !!user.createdAt;
      setIsFirstTimeUser(isNewUser);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        // Apply compact mode spacing
        '& .MuiContainer-root': {
          py: compactMode ? 1 : 2,
        },
        '& .MuiCard-root': {
          mb: compactMode ? 1.5 : 2,
        },
        '& .MuiBox-root': {
          mb: compactMode ? 0.5 : 1.5,
        },
        // Global modern scrollbar styles
        '& *::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '& *::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '& *::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          '&:hover': {
            background: 'rgba(0,0,0,0.3)',
          }
        },
        '& *': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
        }
      }}>
        {isAuthenticated ? (
          <ModernLayout>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />
                <Route
                  path="/profile"
                  element={<ProfilePage />}
                />
                <Route
                  path="/settings"
                  element={<SettingsPage />}
                />
                <Route
                  path="/resumes"
                  element={<ResumePage />}
                />
                <Route
                  path="/applications"
                  element={<ApplicationsPage />}
                />
                <Route
                  path="/interviews"
                  element={<InterviewsPage />}
                />
                <Route
                  path="/portfolio"
                  element={<PortfolioPage />}
                />
                <Route
                  path="/motivation"
                  element={<MotivationPage />}
                />
                <Route
                  path="/revenue-tracking"
                  element={<RevenueTrackingPage />}
                />
                <Route
                  path="/pricing"
                  element={<PricingPage />}
                />
                <Route
                  path="/admin"
                  element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" />}
                />
                {/* Templates route removed */}

                {/* Default redirect */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" />}
                />

                {/* Catch all route */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" />}
                />
              </Routes>
            </Suspense>
          </ModernLayout>
        ) : (
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={<LoginPage />}
              />
              <Route
                path="/register"
                element={<RegisterPage />}
              />
              <Route
                path="/pricing"
                element={<PricingPage />}
              />
              <Route
                path="/"
                element={<BrandedLanding />}
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={<Navigate to="/" />}
              />
            </Routes>
          </Suspense>
        )}

        {/* UX Enhancement Components */}
        {isAuthenticated && flags.loaded && (
          <>
            <SimpleTour isFirstTime={isFirstTimeUser} />
            <KeyboardShortcuts />
            <CommandPalette />
            <ToastProvider />
            {flags.feedbackWidget && <FeedbackWidget />}
          </>
        )}

        {/* Performance monitoring (development only) */}
        {process.env.NODE_ENV !== 'production' && <PerformanceMonitor />}
      </Box>
    </LocalizationProvider>
  );
}

export default App;