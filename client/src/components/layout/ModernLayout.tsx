import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link as MLink,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  MenuList,
  ListItemAvatar,
  Tooltip,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Description as ResumeIcon,
  Code as PortfolioIcon,
  TrendingUp as MotivationIcon,
  MonetizationOn as RevenueIcon,
  ShowChart as TrendingUpIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  // Removed Templates icon
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store/store';
import { openCommandPalette } from '../common/CommandPalette';

const DRAWER_WIDTH = 256;

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [showCmdHint, setShowCmdHint] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Job Applications', path: '/applications', icon: <WorkIcon /> },
    { label: 'Interviews', path: '/interviews', icon: <EventIcon /> },
    { label: 'Resumes', path: '/resumes', icon: <ResumeIcon /> },
    { label: 'Portfolio', path: '/portfolio', icon: <PortfolioIcon /> },
    { label: 'Motivation', path: '/motivation', icon: <MotivationIcon /> },
    { label: 'Revenue & Market', path: '/revenue-tracking', icon: <RevenueIcon /> },
    // Templates removed
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', path: '/admin', icon: <SettingsIcon /> }] : []),
    { label: 'Pricing', path: '/pricing', icon: <TrendingUpIcon /> },
  ];

  const prefetchRoute = (path: string) => {
    switch (path) {
      case '/dashboard':
        import('../../pages/DashboardPage');
        break;
      case '/applications':
        import('../../pages/ModernApplicationsPage');
        break;
      case '/interviews':
        import('../../pages/InterviewsPage');
        break;
      case '/resumes':
        import('../../pages/ResumePage');
        break;
      case '/portfolio':
        import('../../pages/PortfolioPage');
        break;
      case '/motivation':
        import('../../pages/MotivationPage');
        break;
      case '/revenue-tracking':
        import('../../pages/RevenueTrackingPage');
        break;
      case '/pricing':
        import('../../pages/PricingPage');
        break;
      case '/admin':
        import('../../pages/AdminPage');
        break;
      default:
        break;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // In a real app, notifications would come from your notification system
  const notifications: any[] = []; // Empty for now - will be populated by real notification system

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  // First-run snackbar for Command Palette discoverability
  React.useEffect(() => {
    if (!isMobile) {
      try {
        const key = 'cp_cmd_palette_hint_v1';
        const seen = localStorage.getItem(key) === 'true';
        if (!seen) {
          setShowCmdHint(true);
          localStorage.setItem(key, 'true');
        }
      } catch {}
    }
  }, [isMobile]);

  // Sidebar content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} aria-label="Sidebar navigation">
      {/* Logo/Brand */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            cursor: 'pointer'
          }}
          onClick={() => handleNavigation('/dashboard')}
        >
          {sidebarCollapsed ? 'CP' : 'Career Portfolio'}
        </Typography>
        {!sidebarCollapsed && (
          <Typography variant="body2" color="text.secondary">
            Build your future
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 2 }} aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => prefetchRoute(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: sidebarCollapsed ? 0 : 40, justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 700 : 500
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info at bottom */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 40, height: 40, fontSize: '0.9rem' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          {!sidebarCollapsed && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', maxWidth: '100%' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ textAlign: 'center', maxWidth: '100%', overflowWrap: 'anywhere' }}
              >
                {user?.email}
              </Typography>
            </>
          )}
        </Box>
        {!sidebarCollapsed && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', opacity: 0.7 }}>
            Demo – not for commercial use
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: sidebarCollapsed ? 72 : DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              backgroundColor: 'background.paper'
            },
          }}
          PaperProps={{ id: 'primary-navigation-drawer', 'aria-label': 'Mobile navigation' }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? 72 : DRAWER_WIDTH,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
          PaperProps={{ 'aria-label': 'Sidebar navigation' }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
         <Paper 
          elevation={0}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 2, 
            py: 1.25,
            borderRadius: 0,
            borderBottom: '1px solid',
             borderColor: 'divider',
             background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.55) 100%)' : undefined,
             backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : undefined,
          }}
          component="header"
          role="banner"
          aria-label="Top bar"
        >
          {/* Left: Mobile menu button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton 
                onClick={handleDrawerToggle}
                aria-label="Open navigation menu"
                aria-controls="primary-navigation-drawer"
                aria-expanded={mobileOpen ? 'true' : undefined}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Breadcrumbs aria-label="breadcrumbs" separator="/" sx={{ mb: 0.25 }}>
                <MLink
                  underline="hover"
                  color="inherit"
                  onClick={() => handleNavigation('/dashboard')}
                  sx={{ cursor: 'pointer' }}
                >
                  Home
                </MLink>
                <Typography color="text.secondary" variant="caption">
                  {navigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </Typography>
              </Breadcrumbs>
              <Typography variant="subtitle1">
                {navigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </Typography>
            </Box>
          </Box>

          {/* Right: Search, notifications, profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <IconButton onClick={() => setSidebarCollapsed(v => !v)} aria-label="Toggle sidebar width">
                  <ChevronLeftIcon sx={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </IconButton>
              </Tooltip>
            )}
            <TextField size="small" placeholder="Search • Press Ctrl+K for commands" aria-label="Global search" sx={{ width: { xs: 140, sm: 260 } }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ) }}
            />
            <Tooltip title="Command Palette (Ctrl+K)">
              <IconButton onClick={() => openCommandPalette()} aria-label="Open Command Palette" onMouseEnter={() => {
                // Prefetch common routes on hover to improve perceived performance
                import('../../pages/ModernApplicationsPage');
                import('../../pages/InterviewsPage');
                import('../../pages/ResumePage');
                import('../../pages/DashboardPage');
              }}>
                <KeyboardIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton 
              onClick={handleNotificationClick}
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-controls={Boolean(notificationAnchor) ? 'notifications-menu' : undefined}
            >
              <Badge badgeContent={notifications.length || null} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton 
              onClick={handleMenu}
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-controls={Boolean(anchorEl) ? 'profile-menu' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Paper>

        {/* Hero Page Header */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: '1px solid', borderColor: 'divider', background:
          theme.palette.mode === 'dark' ? 'radial-gradient(800px 300px at 0% 0%, rgba(59,130,246,0.12) 0%, rgba(0,0,0,0) 60%), radial-gradient(600px 240px at 100% 0%, rgba(139,92,246,0.10) 0%, rgba(0,0,0,0) 60%)' : 'transparent'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {navigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {location.pathname === '/dashboard' && 'Overview of your portfolio, progress, and upcoming actions.'}
            {location.pathname === '/applications' && 'Track your applications and keep momentum.'}
            {location.pathname === '/interviews' && 'Prepare and reflect to perform your best.'}
            {location.pathname === '/resumes' && 'Craft role-targeted resumes with clarity.'}
            {location.pathname === '/portfolio' && 'Curate projects that tell your story.'}
            {location.pathname === '/motivation' && 'Build consistent habits and celebrate wins.'}
            {location.pathname === '/revenue-tracking' && 'Measure what matters to grow impact.'}
          </Typography>
        </Box>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }} component="main" role="main" aria-label="Page content">
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        id="profile-menu"
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Modern Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        id="notifications-menu"
        PaperProps={{
          sx: { 
            width: 380, 
            maxHeight: 500,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 3, 
            pb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {notifications.length === 0 ? "You're all caught up" : `${notifications.length} new notifications`}
              </Typography>
        </Box>
        
        {/* Content */}
        <Box
          sx={{
            maxHeight: 350,
            overflowY: 'auto',
            // Modern scrollbar styles
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              }
            },
            // Firefox scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent',
          }}
        >
          {notifications.length === 0 ? (
            // Empty state
            <Box 
              sx={{ 
                py: 6, 
                px: 3, 
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                You're all caught up
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                We'll notify you when something important happens
              </Typography>
            </Box>
          ) : (
            // Notifications list
            <MenuList sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <MenuItem
                  key={notification.id}
                  onClick={handleNotificationClose}
                  sx={{
                    py: 2.5,
                    px: 3,
                    backgroundColor: notification.unread ? 'action.hover' : 'transparent',
                    borderBottom: index < notifications.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        backgroundColor: 'primary.light',
                        color: 'primary.main'
                      }}
                    >
                      {notification.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                  {notification.unread && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        ml: 2,
                        flexShrink: 0
                      }}
                    />
                  )}
                </MenuItem>
              ))}
            </MenuList>
          )}
        </Box>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              backgroundColor: 'grey.50',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              View All Notifications
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Command Palette first-run hint */}
      <Snackbar
        open={showCmdHint}
        onClose={() => setShowCmdHint(false)}
        autoHideDuration={6000}
        message="New: Command Palette (Ctrl+K)"
        action={
          <Button color="primary" size="small" onClick={() => { openCommandPalette(); setShowCmdHint(false); }}>
            Try it
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  );
};

export default ModernLayout;