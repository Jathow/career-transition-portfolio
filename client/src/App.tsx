import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Container } from '@mui/material';
import { RootState, AppDispatch } from './store/store';
import { checkAuthStatus } from './store/slices/authSlice';
import { useTheme } from './contexts/ThemeContext';
import ModernLayout from './components/layout/ModernLayout';
import SimpleTour from './components/common/SimpleTour';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';
import ExportDialog from './components/common/ExportDialog';
import LoadingSpinner from './components/common/LoadingSpinner';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import BrandedLanding from './components/common/BrandedLanding';

// Lazy load pages for code splitting
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ResumePage = React.lazy(() => import('./pages/ResumePage'));
const ApplicationsPage = React.lazy(() => import('./pages/ModernApplicationsPage'));
const InterviewsPage = React.lazy(() => import('./pages/InterviewsPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const MotivationPage = React.lazy(() => import('./pages/MotivationPage'));
const RevenueTrackingPage = React.lazy(() => import('./pages/RevenueTrackingPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

// Loading fallback component for Suspense
const PageLoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <LoadingSpinner />
  </Box>
);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const { compactMode } = useTheme();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    dispatch(checkAuthStatus());

    // Debug: Log app version to verify deployment
    console.log('🚀 App loaded - Build timestamp:', new Date().toISOString());
  }, [dispatch]);

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
          py: compactMode ? 2 : 3,
        },
        '& .MuiCard-root': {
          mb: compactMode ? 2 : 3,
        },
        '& .MuiBox-root': {
          mb: compactMode ? 1 : 2,
        },
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
                  path="/admin"
                  element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" />}
                />

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
        {isAuthenticated && (
          <>
            <SimpleTour isFirstTime={isFirstTimeUser} />
            <KeyboardShortcuts />
            <ExportDialog
              open={showExportDialog}
              onClose={() => setShowExportDialog(false)}
            />
          </>
        )}

        {/* Performance monitoring (development only) */}
        <PerformanceMonitor />
      </Box>
    </LocalizationProvider>
  );
}

export default App;