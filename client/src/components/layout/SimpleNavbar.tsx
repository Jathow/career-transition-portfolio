import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Description as ResumeIcon,
  Code as PortfolioIcon,
  TrendingUp as MotivationIcon,
  MonetizationOn as RevenueIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store/store';

const SimpleNavbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Applications', path: '/applications', icon: <WorkIcon /> },
    { label: 'Interviews', path: '/interviews', icon: <EventIcon /> },
    { label: 'Resumes', path: '/resumes', icon: <ResumeIcon /> },
    { label: 'Portfolio', path: '/portfolio', icon: <PortfolioIcon /> },
    { label: 'Motivation', path: '/motivation', icon: <MotivationIcon /> },
    { label: 'Revenue & Market', path: '/revenue-tracking', icon: <RevenueIcon /> },
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', path: '/admin', icon: <SettingsIcon /> }] : []),
  ];

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    setMobileOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
    setMobileOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.email}
        </Typography>
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem onClick={handleProfile} sx={{ cursor: 'pointer' }}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ cursor: 'pointer', color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ minHeight: '64px !important', height: 64 }}>
          {/* Left: Menu + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}
            <Button
              onClick={() => navigate('/dashboard')}
              sx={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'transparent', opacity: 0.8 }
              }}
            >
              Career Portfolio
            </Button>
          </Box>

          {/* Center: Navigation (Desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, ml: 4 }}>
              {navigationItems.slice(0, 6).map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  sx={{ 
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right: Search + Notifications + Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {!isMobile && (
              <TextField
                size="small"
                placeholder="Search..."
                sx={{ width: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            <IconButton>
              <NotificationsIcon />
            </IconButton>

            <IconButton onClick={handleMenu}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default SimpleNavbar;