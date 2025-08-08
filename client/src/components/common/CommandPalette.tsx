import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Description as ResumeIcon,
  Code as PortfolioIcon,
  TrendingUp as MotivationIcon,
  MonetizationOn as RevenueIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type Command = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  perform: () => void;
  category: 'Create' | 'Navigate';
};

const dispatchOpenEvent = () => {
  const event = new CustomEvent('open-command-palette');
  window.dispatchEvent(event);
};

export const openCommandPalette = dispatchOpenEvent;

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const clickBySelector = useCallback((selector: string) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) el.click();
  }, []);

  const commands: Command[] = useMemo(() => ([
    // Create
    {
      id: 'create-project',
      title: 'Create Project',
      subtitle: 'Add a new portfolio project',
      icon: <AddIcon />,
      category: 'Create',
      perform: () => clickBySelector('[data-tour="create-project"]'),
    },
    {
      id: 'new-application',
      title: 'New Job Application',
      subtitle: 'Track a job you applied to',
      icon: <AddIcon />,
      category: 'Create',
      perform: () => clickBySelector('[data-tour="new-application"]'),
    },
    {
      id: 'schedule-interview',
      title: 'Schedule Interview',
      subtitle: 'Add an upcoming interview',
      icon: <AddIcon />,
      category: 'Create',
      perform: () => clickBySelector('[data-tour="new-interview"]'),
    },
    {
      id: 'set-goal',
      title: 'Set New Goal',
      subtitle: 'Create a motivation goal',
      icon: <AddIcon />,
      category: 'Create',
      perform: () => clickBySelector('[data-tour="new-goal"]'),
    },
    // Navigate
    { id: 'nav-dashboard', title: 'Go to Dashboard', icon: <DashboardIcon />, category: 'Navigate', perform: () => navigate('/dashboard') },
    { id: 'nav-applications', title: 'Go to Applications', icon: <WorkIcon />, category: 'Navigate', perform: () => navigate('/applications') },
    { id: 'nav-interviews', title: 'Go to Interviews', icon: <EventIcon />, category: 'Navigate', perform: () => navigate('/interviews') },
    { id: 'nav-resumes', title: 'Go to Resumes', icon: <ResumeIcon />, category: 'Navigate', perform: () => navigate('/resumes') },
    { id: 'nav-portfolio', title: 'Go to Portfolio', icon: <PortfolioIcon />, category: 'Navigate', perform: () => navigate('/portfolio') },
    { id: 'nav-motivation', title: 'Go to Motivation', icon: <MotivationIcon />, category: 'Navigate', perform: () => navigate('/motivation') },
    { id: 'nav-revenue', title: 'Go to Revenue & Market', icon: <RevenueIcon />, category: 'Navigate', perform: () => navigate('/revenue-tracking') },
    { id: 'nav-profile', title: 'Go to Profile', icon: <PersonIcon />, category: 'Navigate', perform: () => navigate('/profile') },
    { id: 'nav-settings', title: 'Open Settings', icon: <SettingsIcon />, category: 'Navigate', perform: () => navigate('/settings') },
  ]), [clickBySelector, navigate]);

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      setQuery('');
      setSelectedIndex(0);
    };
    window.addEventListener('open-command-palette', openHandler as EventListener);
    return () => window.removeEventListener('open-command-palette', openHandler as EventListener);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 1.5 }}>
        <Box sx={{ mb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Type a command or search actions..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map((cmd, idx) => (
            <ListItem key={cmd.id} disablePadding>
              <ListItemButton
                selected={idx === selectedIndex}
                onClick={() => { cmd.perform(); setOpen(false); }}
              >
                <ListItemIcon>{cmd.icon}</ListItemIcon>
                <ListItemText
                  primary={cmd.title}
                  secondary={cmd.subtitle ? (
                    <Typography variant="caption" color="text.secondary">{cmd.subtitle}</Typography>
                  ) : undefined}
                />
                <Typography variant="overline" sx={{ opacity: 0.6 }}>{cmd.category}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No matching commands</Typography>
            </Box>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;


