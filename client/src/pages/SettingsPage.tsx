import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../contexts/ThemeContext';
import { useTutorial } from '../contexts/TutorialContext';
// Removed export dialog
import KeyboardShortcuts from '../components/common/KeyboardShortcuts';
import { preferencesAPI } from '../services/api';
import { autoSaveManager } from '../utils/autoSave';

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { setDarkMode, setCompactMode } = useTheme();
  const { setShowTutorials } = useTutorial();
  
  // Removed export dialog state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true,
    updates: false,
  });
  const [preferences, setPreferences] = useState({
    darkMode: true,
    compactMode: false,
    autoSave: true,
    showTutorials: true,
  });

  // Load settings from API on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const response = await preferencesAPI.getPreferences();
        const userPrefs = response.data.data;
        
        // Map API response to local state
        const newPreferences = {
          darkMode: userPrefs.darkMode,
          compactMode: userPrefs.compactMode,
          autoSave: userPrefs.autoSave,
          showTutorials: userPrefs.showTutorials,
        };
        
        const newNotifications = {
          email: userPrefs.emailNotifications,
          push: userPrefs.pushNotifications,
          reminders: userPrefs.reminderNotifications,
          updates: userPrefs.updateNotifications,
        };
        
        setPreferences(newPreferences);
        setNotifications(newNotifications);
        
        // Apply theme changes immediately
        setDarkMode(userPrefs.darkMode);
        setCompactMode(userPrefs.compactMode);
        
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to localStorage if API fails
        const savedNotifications = localStorage.getItem('notification-settings');
        const savedPreferences = localStorage.getItem('user-preferences');
        
        if (savedNotifications) {
          try {
            setNotifications(JSON.parse(savedNotifications));
          } catch (error) {
            console.error('Error loading notification settings:', error);
          }
        }
        
        if (savedPreferences) {
          try {
            const parsedPreferences = JSON.parse(savedPreferences);
            setPreferences(parsedPreferences);
            setDarkMode(parsedPreferences.darkMode);
            setCompactMode(parsedPreferences.compactMode);
          } catch (error) {
            console.error('Error loading preferences:', error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [setDarkMode, setCompactMode]);

  const savePreferencesToAPI = async (newPreferences: any, newNotifications: any) => {
    try {
      await preferencesAPI.updatePreferences({
        darkMode: newPreferences.darkMode,
        compactMode: newPreferences.compactMode,
        autoSave: newPreferences.autoSave,
        showTutorials: newPreferences.showTutorials,
        emailNotifications: newNotifications.email,
        pushNotifications: newNotifications.push,
        reminderNotifications: newNotifications.reminders,
        updateNotifications: newNotifications.updates,
      });
    } catch (error) {
      console.error('Error saving preferences to API:', error);
      // Fallback to localStorage
      localStorage.setItem('user-preferences', JSON.stringify(newPreferences));
      localStorage.setItem('notification-settings', JSON.stringify(newNotifications));
    }
  };

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNotifications = {
      ...notifications,
      [key]: event.target.checked,
    };
    setNotifications(newNotifications);
    
    // Save to API and localStorage
    savePreferencesToAPI(preferences, newNotifications);
    setShowSaveSuccess(true);
  };

  const handlePreferenceChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPreferences = {
      ...preferences,
      [key]: event.target.checked,
    };
    setPreferences(newPreferences);
    
    // Apply settings immediately
    if (key === 'darkMode') {
      setDarkMode(event.target.checked);
    } else if (key === 'compactMode') {
      setCompactMode(event.target.checked);
    } else if (key === 'autoSave') {
      autoSaveManager.setEnabled(event.target.checked);
    } else if (key === 'showTutorials') {
      setShowTutorials(event.target.checked);
    }
    
    // Save to API and localStorage
    savePreferencesToAPI(newPreferences, notifications);
    setShowSaveSuccess(true);
  };

  // Removed export handler

  const handleShowKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
    localStorage.setItem('notification-settings', JSON.stringify(notifications));
    setShowSaveSuccess(true);
  };

  const handleCloseSaveSuccess = () => {
    setShowSaveSuccess(false);
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: <NotificationsIcon />,
      items: [
        {
          label: 'Email Notifications',
          description: 'Receive email updates about your applications and projects',
          value: notifications.email,
          onChange: handleNotificationChange('email'),
        },
        {
          label: 'Push Notifications',
          description: 'Get real-time notifications in your browser',
          value: notifications.push,
          onChange: handleNotificationChange('push'),
        },
        {
          label: 'Reminder Notifications',
          description: 'Deadline and follow-up reminders',
          value: notifications.reminders,
          onChange: handleNotificationChange('reminders'),
        },
        {
          label: 'Product Updates',
          description: 'News about new features and improvements',
          value: notifications.updates,
          onChange: handleNotificationChange('updates'),
        },
      ],
    },
    {
      title: 'Preferences',
      icon: <PaletteIcon />,
      items: [
        {
          label: 'Dark Mode',
          description: 'Use dark theme throughout the application',
          value: preferences.darkMode,
          onChange: handlePreferenceChange('darkMode'),
        },
        {
          label: 'Compact Mode',
          description: 'Reduce spacing for more content on screen',
          value: preferences.compactMode,
          onChange: handlePreferenceChange('compactMode'),
        },
        {
          label: 'Auto Save',
          description: 'Automatically save changes as you type',
          value: preferences.autoSave,
          onChange: handlePreferenceChange('autoSave'),
        },
        {
          label: 'Show Tutorials',
          description: 'Display helpful tips and tutorials',
          value: preferences.showTutorials,
          onChange: handlePreferenceChange('showTutorials'),
        },
      ],
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and application settings.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="body1" color="text.secondary">
            Loading settings...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Settings Sections */}
          <Grid item xs={12} md={8}>
            {settingsSections.map((section, _index) => (
              <Card key={section.title} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: 'primary.main', mr: 1 }}>
                      {section.icon}
                    </Box>
                    <Typography variant="h6">{section.title}</Typography>
                  </Box>
                  <List>
                    {section.items.map((item, itemIndex) => (
                      <React.Fragment key={item.label}>
                        <ListItem>
                          <ListItemText
                            primary={item.label}
                            secondary={item.description}
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              edge="end"
                              checked={item.value}
                              onChange={item.onChange}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {itemIndex < section.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Export removed */}
                  <Button
                    variant="outlined"
                    startIcon={<KeyboardIcon />}
                    onClick={handleShowKeyboardShortcuts}
                    fullWidth
                  >
                    Keyboard Shortcuts
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    onClick={() => localStorage.removeItem('onboarding-completed')}
                    fullWidth
                  >
                    Restart Tutorial
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Info
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body2">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body2">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  These actions cannot be undone.
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                  fullWidth
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Save Settings
        </Button>
      </Box>

      {/* Dialogs */}
      {/* Export dialog removed */}

      <Dialog
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <KeyboardShortcuts />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowKeyboardShortcuts(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action will permanently delete your account and all associated data.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please type "DELETE" to confirm this action.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="Type DELETE to confirm"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSaveSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSaveSuccess} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 