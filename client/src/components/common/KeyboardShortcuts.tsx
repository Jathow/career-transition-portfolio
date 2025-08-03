import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Description as ResumeIcon,
  Code as PortfolioIcon,
  TrendingUp as MotivationIcon,
  MonetizationOn as RevenueIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface Shortcut {
  key: string;
  description: string;
  icon?: React.ReactNode;
  category: string;
}

const KeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation shortcuts
    {
      key: 'g d',
      description: 'Go to Dashboard',
      icon: <DashboardIcon />,
      category: 'Navigation',
    },
    {
      key: 'g a',
      description: 'Go to Applications',
      icon: <WorkIcon />,
      category: 'Navigation',
    },
    {
      key: 'g i',
      description: 'Go to Interviews',
      icon: <EventIcon />,
      category: 'Navigation',
    },
    {
      key: 'g r',
      description: 'Go to Resumes',
      icon: <ResumeIcon />,
      category: 'Navigation',
    },
    {
      key: 'g p',
      description: 'Go to Portfolio',
      icon: <PortfolioIcon />,
      category: 'Navigation',
    },
    {
      key: 'g m',
      description: 'Go to Motivation',
      icon: <MotivationIcon />,
      category: 'Navigation',
    },
    {
      key: 'g v',
      description: 'Go to Revenue & Market',
      icon: <RevenueIcon />,
      category: 'Navigation',
    },
    {
      key: 'g s',
      description: 'Go to Profile',
      icon: <PersonIcon />,
      category: 'Navigation',
    },

    // Action shortcuts
    {
      key: 'ctrl+k',
      description: 'Global Search',
      icon: <SearchIcon />,
      category: 'Actions',
    },
    {
      key: 'n',
      description: 'New Item (context-aware)',
      icon: <AddIcon />,
      category: 'Actions',
    },
    {
      key: '?',
      description: 'Show Keyboard Shortcuts',
      icon: <HelpIcon />,
      category: 'Actions',
    },
    {
      key: ',',
      description: 'Open Settings',
      icon: <SettingsIcon />,
      category: 'Actions',
    },

    // General shortcuts
    {
      key: 'escape',
      description: 'Close dialogs / Cancel',
      category: 'General',
    },
    {
      key: 'enter',
      description: 'Confirm / Submit',
      category: 'General',
    },
    {
      key: 'backspace',
      description: 'Go back',
      category: 'General',
    },
  ];

  // Navigation shortcuts
  useHotkeys('g d', () => navigate('/dashboard'), { preventDefault: true });
  useHotkeys('g a', () => navigate('/applications'), { preventDefault: true });
  useHotkeys('g i', () => navigate('/interviews'), { preventDefault: true });
  useHotkeys('g r', () => navigate('/resumes'), { preventDefault: true });
  useHotkeys('g p', () => navigate('/portfolio'), { preventDefault: true });
  useHotkeys('g m', () => navigate('/motivation'), { preventDefault: true });
  useHotkeys('g v', () => navigate('/revenue-tracking'), { preventDefault: true });
  useHotkeys('g s', () => navigate('/profile'), { preventDefault: true });

  // Action shortcuts
  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    // Focus global search
    const searchInput = document.querySelector('[data-tour="global-search"] input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, { preventDefault: true });

  useHotkeys('?', (e) => {
    e.preventDefault();
    setShowShortcuts(true);
  }, { preventDefault: true });

  useHotkeys('escape', () => {
    setShowShortcuts(false);
  }, { preventDefault: true });

  // Context-aware new item shortcut
  useHotkeys('n', (e) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    
    // Find and click the appropriate "New" button based on current page
    const newButtons = {
      '/dashboard': '[data-tour="create-project"]',
      '/applications': '[data-tour="new-application"]',
      '/interviews': 'button[aria-label*="new"], button[aria-label*="add"]',
      '/resumes': 'button[aria-label*="new"], button[aria-label*="create"]',
    };

    const selector = newButtons[currentPath as keyof typeof newButtons];
    if (selector) {
      const button = document.querySelector(selector) as HTMLButtonElement;
      if (button) {
        button.click();
      }
    }
  }, { preventDefault: true });

  // Don't show shortcuts on mobile
  if (isMobile) {
    return null;
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      <Dialog
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyboardIcon />
              <Typography variant="h6">Keyboard Shortcuts</Typography>
            </Box>
            <Button
              onClick={() => setShowShortcuts(false)}
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use these keyboard shortcuts to navigate and perform actions quickly throughout the application.
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <Grid item xs={12} md={6} key={category}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {categoryShortcuts.map((shortcut, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        {shortcut.icon && (
                          <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                            {shortcut.icon}
                          </Box>
                        )}
                        <Typography variant="body2">
                          {shortcut.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={shortcut.key}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Pro Tips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use <Chip label="g" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> + letter to navigate quickly
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Press <Chip label="?" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> anytime to see this help
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use <Chip label="Ctrl+K" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /> for instant search across all data
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowShortcuts(false)}>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KeyboardShortcuts; 