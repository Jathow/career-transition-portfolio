import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import App from './App';
import { AppThemeProvider, useTheme } from './contexts/ThemeContext';
import { TutorialProvider } from './contexts/TutorialContext';
import * as serviceWorker from './serviceWorker';

const AppWrapper: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TutorialProvider>
        <App />
      </TutorialProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppThemeProvider>
          <AppWrapper />
        </AppThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// Disable service worker temporarily to fix login issues
// TODO: Re-enable after fixing CSP and caching issues
serviceWorker.unregister();
// Warm routes after idle for faster first navigations
serviceWorker.warmRoutes();