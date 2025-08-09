import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Description as ResumeIcon,
  Code as PortfolioIcon,
  TrendingUp as MotivationIcon,
  MonetizationOn as RevenueIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface SearchResult {
  id: string;
  type: 'project' | 'application' | 'interview' | 'resume' | 'motivation' | 'revenue';
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
  status?: string;
  date?: string;
}

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <PortfolioIcon />;
      case 'application': return <WorkIcon />;
      case 'interview': return <EventIcon />;
      case 'resume': return <ResumeIcon />;
      case 'motivation': return <MotivationIcon />;
      case 'revenue': return <RevenueIcon />;
      default: return <DashboardIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'primary';
      case 'application': return 'secondary';
      case 'interview': return 'success';
      case 'resume': return 'info';
      case 'motivation': return 'warning';
      case 'revenue': return 'error';
      default: return 'default';
    }
  };

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [applicationsResponse, projectsResponse, interviewsResponse] = await Promise.all([
        api.get(`/applications?search=${encodeURIComponent(term)}`),
        api.get(`/projects?search=${encodeURIComponent(term)}`),
        api.get(`/interviews?search=${encodeURIComponent(term)}`),
      ]);

      const applications = applicationsResponse.data.data || [];
      const projects = projectsResponse.data.data || [];
      const interviews = interviewsResponse.data.data || [];

      const searchResults: SearchResult[] = [
        ...applications.map((app: any) => ({
          id: app.id,
          type: 'application' as const,
          title: app.jobTitle,
          subtitle: app.companyName,
          path: `/applications/${app.id}`,
          icon: getTypeIcon('application'),
          status: app.status,
          date: app.applicationDate,
        })),
        ...projects.map((project: any) => ({
          id: project.id,
          type: 'project' as const,
          title: project.title,
          subtitle: project.description,
          path: `/dashboard`,
          icon: getTypeIcon('project'),
          status: project.status,
          date: project.targetEndDate,
        })),
        ...interviews.map((interview: any) => ({
          id: interview.id,
          type: 'interview' as const,
          title: `Interview - ${interview.interviewType}`,
          subtitle: interview.companyName || 'Scheduled Interview',
          path: `/interviews/${interview.id}`,
          icon: getTypeIcon('interview'),
          status: interview.outcome,
          date: interview.scheduledDate,
        })),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSelectedIndex(-1);
    setOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedIndex(-1);
    setOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box ref={anchorRef} sx={{ position: 'relative', width: isMobile ? '100%' : 350 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search projects, applications, interviews..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        inputProps={{
          role: 'combobox',
          'aria-expanded': open ? 'true' : 'false',
          'aria-controls': open ? 'global-search-results' : undefined,
          'aria-autocomplete': 'list',
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon color="action" />
              )}
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                aria-label="Clear search"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
          '& .MuiInputBase-root': {
            height: '40px',
          },
        }}
      />

      <Popper
        open={open && (results.length > 0 || loading)}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
        id="global-search-results"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
                backgroundColor: 'background.paper',
              }}
            >
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Searching...
                  </Typography>
                </Box>
              ) : results.length > 0 ? (
                <List dense>
                  {results.map((result, index) => (
                    <ListItem
                      key={`${result.type}-${result.id}`}
                      disablePadding
                      sx={{
                        backgroundColor: index === selectedIndex ? 'action.selected' : 'transparent',
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleResultClick(result)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: `${getTypeColor(result.type)}.main` }}>
                          {result.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" noWrap>
                                {result.title}
                              </Typography>
                              {result.status && (
                                <Chip
                                  label={result.status}
                                  size="small"
                                  color={getTypeColor(result.type) as any}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {result.subtitle}
                              </Typography>
                              {result.date && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {formatDate(result.date)}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : searchTerm && !loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No results for "{searchTerm}"
                  </Typography>
                </Box>
              ) : null}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default GlobalSearch; 