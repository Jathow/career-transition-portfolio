import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { preferencesAPI } from '../services/api';
import { autoSaveManager } from '../utils/autoSave';
import { getBrandConfig } from '../config/brand';

interface ThemeContextType {
  darkMode: boolean;
  compactMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  setCompactMode: (compactMode: boolean) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Load user preferences only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadPreferences = async () => {
      try {
        const response = await preferencesAPI.getPreferences();
        const prefs = response.data.data;
        setDarkMode(prefs.darkMode);
        setCompactMode(prefs.compactMode);
        await autoSaveManager.loadAutoSavePreference();
      } catch (error) {
        // Fallback to localStorage
        const savedPrefs = localStorage.getItem('user-preferences');
        if (savedPrefs) {
          try {
            const prefs = JSON.parse(savedPrefs);
            setDarkMode(prefs.darkMode);
            setCompactMode(prefs.compactMode);
            autoSaveManager.setEnabled(prefs.autoSave);
          } catch (e) {
            console.error('Error parsing saved preferences:', e);
          }
        }
      }
    };

    loadPreferences();
  }, [isAuthenticated]);

  // Get brand configuration based on theme mode
  const brandConfig = getBrandConfig(darkMode);
  
  // Create theme based on current settings and brand configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: brandConfig.colors.primary.main,
        light: brandConfig.colors.primary.light,
        dark: brandConfig.colors.primary.dark,
        contrastText: brandConfig.colors.primary.contrastText,
      },
      secondary: {
        main: brandConfig.colors.secondary.main,
        light: brandConfig.colors.secondary.light,
        dark: brandConfig.colors.secondary.dark,
        contrastText: brandConfig.colors.secondary.contrastText,
      },
      success: {
        main: brandConfig.colors.success.main,
        light: brandConfig.colors.success.light,
        dark: brandConfig.colors.success.dark,
      },
      warning: {
        main: brandConfig.colors.warning.main,
        light: brandConfig.colors.warning.light,
        dark: brandConfig.colors.warning.dark,
      },
      error: {
        main: brandConfig.colors.error.main,
        light: brandConfig.colors.error.light,
        dark: brandConfig.colors.error.dark,
      },
      info: {
        main: brandConfig.colors.info.main,
        light: brandConfig.colors.info.light,
        dark: brandConfig.colors.info.dark,
      },
      grey: brandConfig.colors.grey,
      background: {
        default: darkMode ? brandConfig.colors.grey[50] : brandConfig.colors.grey[100],
        paper: darkMode ? brandConfig.colors.grey[100] : '#ffffff',
      },
      divider: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)'
    },
    typography: {
      fontFamily: brandConfig.typography.fontFamily.primary,
      h1: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.bold,
        letterSpacing: 0.2,
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.semiBold,
        letterSpacing: 0.15,
        lineHeight: 1.25,
      },
      h3: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.semiBold,
        letterSpacing: 0.1,
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.medium,
        letterSpacing: 0.1,
      },
      h5: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.medium,
        letterSpacing: 0.05,
      },
      h6: {
        fontFamily: brandConfig.typography.fontFamily.secondary,
        fontWeight: brandConfig.typography.fontWeight.medium,
        letterSpacing: 0.05,
      },
      body1: {
        fontFamily: brandConfig.typography.fontFamily.primary,
        fontWeight: brandConfig.typography.fontWeight.regular,
        letterSpacing: 0.05,
        lineHeight: 1.65,
      },
      body2: {
        fontFamily: brandConfig.typography.fontFamily.primary,
        fontWeight: brandConfig.typography.fontWeight.regular,
        letterSpacing: 0.03,
        lineHeight: 1.6,
      },
    },
    shape: { borderRadius: brandConfig.radius.md },
    spacing: compactMode ? brandConfig.spacing.sm : brandConfig.spacing.md,
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
          disableTouchRipple: true,
          focusRipple: false,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: brandConfig.radius.md,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              boxShadow: `0 0 0 3px ${darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.2)'}`,
            },
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'lg',
        },
        styleOverrides: {
          root: {
            paddingTop: compactMode ? brandConfig.spacing.md : brandConfig.spacing.lg,
            paddingBottom: compactMode ? brandConfig.spacing.md : brandConfig.spacing.lg,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: darkMode
              ? 'radial-gradient(1200px 600px at -10% -10%, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 60%), radial-gradient(1000px 500px at 110% -10%, rgba(139,92,246,0.12) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, #0b1220 0%, #111827 100%)'
              : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            colorScheme: darkMode ? 'dark' : 'light',
          },
          '::selection': {
            backgroundColor: brandConfig.colors.primary.main,
            color: brandConfig.colors.primary.contrastText,
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.35)' : brandConfig.shadows.md,
            borderRadius: brandConfig.radius.lg,
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.6)' : undefined,
            backdropFilter: darkMode ? 'saturate(140%) blur(10px)' : undefined,
            border: `1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : '#e2e8f0'}`,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: darkMode ? '0 12px 30px rgba(0,0,0,0.45)' : brandConfig.shadows.lg,
            },
          },
        },
        defaultProps: {
          elevation: 1,
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: compactMode ? 12 : 20,
          },
          title: {
            fontWeight: brandConfig.typography.fontWeight.semiBold,
          },
          subheader: {
            opacity: 0.8,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: compactMode ? 12 : 20,
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: compactMode ? 8 : 12,
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          margin: 'dense',
          fullWidth: true,
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          margin: 'dense',
          fullWidth: true,
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: brandConfig.radius.md,
              backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#fff',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.24)' : '#94a3b8',
              },
              '&.Mui-focused fieldset': {
                borderColor: brandConfig.colors.primary.main,
                borderWidth: 1.5,
              },
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          outlined: {
            borderRadius: brandConfig.radius.md,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: brandConfig.typography.fontWeight.medium,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginTop: 4,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            borderRadius: brandConfig.radius.md,
            fontWeight: brandConfig.typography.fontWeight.semiBold,
            textTransform: 'none',
            boxShadow: darkMode ? '0 6px 16px rgba(59,130,246,0.18)' : brandConfig.shadows.sm,
            transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
            '&:hover': {
              boxShadow: darkMode ? '0 10px 24px rgba(59,130,246,0.25)' : brandConfig.shadows.md,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          containedPrimary: {
            backgroundImage: darkMode
              ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              : undefined,
            boxShadow: darkMode ? '0 8px 20px rgba(99,102,241,0.35)' : undefined,
          },
          outlinedPrimary: {
            borderColor: darkMode ? 'rgba(148,163,184,0.28)' : undefined,
            background: darkMode ? 'rgba(255,255,255,0.02)' : undefined,
          },
          startIcon: {
            marginRight: 6,
          },
          endIcon: {
            marginLeft: 6,
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'small',
          disableRipple: true,
        },
      },
      MuiChip: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            borderRadius: brandConfig.radius.md,
          },
          outlined: {
            borderColor: darkMode ? 'rgba(148,163,184,0.24)' : '#cbd5e1',
          },
          icon: {
            marginLeft: 6,
          },
          deleteIcon: {
            marginRight: 4,
          },
        },
      },
      MuiListItem: {
        defaultProps: {
          dense: true,
        },
      },
      MuiMenuItem: {
        defaultProps: {
          dense: true,
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: compactMode ? 12 : 18,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: compactMode ? 12 : 18,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: compactMode ? 10 : 16,
            gap: 8,
            justifyContent: 'flex-end',
          },
        },
      },
      MuiGrid: {
        defaultProps: {
          // Apply a sensible default spacing across the app
          spacing: compactMode ? 2 : 3,
        } as any,
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(148,163,184,0.06)' : 'rgba(15,23,42,0.03)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: brandConfig.radius.lg,
            backgroundImage: 'none',
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.6)' : '#ffffff',
            backdropFilter: darkMode ? 'saturate(160%) blur(8px)' : undefined,
            border: `1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : '#e2e8f0'}`,
          },
        },
      },
      MuiMenu: {
        defaultProps: {
          transitionDuration: 120,
        },
        styleOverrides: {
          paper: {
            borderRadius: brandConfig.radius.lg,
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode ? 'linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.55) 100%)' : '#ffffff',
            backdropFilter: 'saturate(180%) blur(10px)',
            borderBottom: `1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : '#e2e8f0'}`,
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          enterDelay: 0,
          enterNextDelay: 0,
          leaveDelay: 0,
        },
        styleOverrides: {
          tooltip: {
            borderRadius: brandConfig.radius.md,
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          fullWidth: true,
          maxWidth: 'sm',
          transitionDuration: 120,
        },
        styleOverrides: {
          paper: {
            borderRadius: brandConfig.radius.lg,
          },
        },
      },
      MuiListItemButton: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            borderRadius: brandConfig.radius.md,
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(59,130,246,0.16)' : 'rgba(59,130,246,0.08)',
            },
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)',
            },
            transition: 'background-color 120ms ease',
          },
        },
      },
      MuiDrawer: {
        defaultProps: {
          transitionDuration: 120,
        },
      },
    },
  });

  const value = {
    darkMode,
    compactMode,
    setDarkMode,
    setCompactMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 