import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  fetchApplications,
  searchApplications,
  setFilters,
  setSearchTerm,
  deleteApplication,
  JobApplication,
  JobApplicationFilters
} from '../../store/slices/jobApplicationSlice';
import ApplicationForm from './ApplicationForm';
import ApplicationDetail from './ApplicationDetail';

const ApplicationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    applications, 
    loading, 
    error, 
    filters, 
    searchTerm 
  } = useAppSelector((state) => state.jobApplications);

  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchApplications(filters));
  }, [dispatch, filters]);

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
    if (term.trim()) {
      dispatch(searchApplications(term));
    } else {
      dispatch(fetchApplications(filters));
    }
  };

  const handleFilterChange = (newFilters: Partial<JobApplicationFilters>) => {
    dispatch(setFilters({ ...filters, ...newFilters }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, application: JobApplication) => {
    setAnchorEl(event.currentTarget);
    setActiveApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveApplication(null);
  };

  const handleEdit = () => {
    if (activeApplication) {
      setSelectedApplication(activeApplication);
      setShowForm(true);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (activeApplication) {
      setSelectedApplication(activeApplication);
      setShowDetail(true);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (activeApplication) {
      if (window.confirm('Are you sure you want to delete this application?')) {
        await dispatch(deleteApplication(activeApplication.id));
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'default';
      case 'SCREENING':
        return 'info';
      case 'INTERVIEW':
        return 'warning';
      case 'OFFER':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'WITHDRAWN':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Job Applications
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          data-tour="new-application"
        >
          New Application
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }} data-tour="application-filters">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              {Object.keys(filters).length > 0 && (
                <Chip 
                  label={`${Object.keys(filters).length} active`} 
                  color="primary" 
                  size="small" 
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {showFilters && (
          <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="APPLIED">Applied</MenuItem>
                    <MenuItem value="SCREENING">Screening</MenuItem>
                    <MenuItem value="INTERVIEW">Interview</MenuItem>
                    <MenuItem value="OFFER">Offer</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={filters.companyName || ''}
                  onChange={(e) => handleFilterChange({ companyName: e.target.value || undefined })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  onClick={() => dispatch(setFilters({}))}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Applications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No applications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first job application'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {applications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon color="action" fontSize="small" />
                        <Typography variant="h6" component="h2">
                          {application.companyName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkIcon color="action" fontSize="small" />
                        <Typography variant="body1" color="text.secondary">
                          {application.jobTitle}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          Applied: {formatDate(application.applicationDate)}
                        </Typography>
                        {application.followUpDate && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Follow-up: {formatDate(application.followUpDate)}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {application.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {truncateText(application.notes, 100)}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={application.status}
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                        {application.resume && (
                          <Chip
                            label={`Resume: ${application.resume.versionName}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="View job posting">
                        <IconButton
                          size="small"
                          onClick={() => window.open(application.jobUrl, '_blank')}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, application)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Forms and Modals */}
      <ApplicationForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
      />

      <ApplicationDetail
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
      />
    </Box>
  );
};

export default ApplicationList; 