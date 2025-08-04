import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Typography,
  Stack,
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
} from '@mui/icons-material';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store/store';
import NotificationCenter from '../common/NotificationCenter';
import GlobalSearch from '../common/GlobalSearch';
import BrandedLogo from '../common/BrandedLogo';

const Navbar: React.FC = () => {
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

  const handleSettings = () => {
    navigate('/settings');
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
    <Box sx={{ width: 280, height: '100%' }}>
      <Box sx={{ 
        p: 3, 
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ 
            width: 48, 
            height: 48,
            backgroundColor: 'primary.contrastText',
            color: 'primary.main',
            fontWeight: 600,
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user?.email}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      <List>
        <ListItem 
          onClick={handleProfile}
          sx={{
            mx: 1,
            mb: 0.5,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem 
          onClick={handleSettings}
          sx={{
            mx: 1,
            mb: 0.5,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem 
          onClick={handleLogout}
          sx={{
            mx: 1,
            borderRadius: 2,
            cursor: 'pointer',
            color: 'error.main',
            '&:hover': { backgroundColor: 'error.50' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Simple Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 64,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ 
            height: '100%',
            px: 3,
          }}
        >
          {/* Left: Logo */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box
              onClick={() => navigate('/dashboard')}
              sx={{ 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                mt: 0.5, // Push logo down slightly
                '&:hover': { opacity: 0.8 } 
              }}
            >
              <BrandedLogo
                variant={isMobile ? 'compact' : 'full'}
                size="medium"
                color="primary"
              />
            </Box>
          </Stack>

          {/* Center: Navigation (Desktop) */}
          {!isMobile && (
            <Stack direction="row" spacing={1}>
              {navigationItems.map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <IconButton 
                    onClick={() => handleNavigation(item.path)}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          )}

          {/* Right: Actions */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <GlobalSearch />
              </Box>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <NotificationCenter />
            </Box>
            {!isMobile && (
              <Tooltip title={`${user?.firstName} ${user?.lastName}`} arrow>
                <IconButton onClick={handleMenu} sx={{ color: 'text.primary' }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      fontSize: '0.875rem',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 2,
            }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleLogout} 
          sx={{ py: 1.5, color: 'error.main', '&:hover': { backgroundColor: 'error.50' } }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;