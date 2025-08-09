import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { RootState } from '../store/store';
import { fetchProjects, deleteProject, completeProject, updateProjectStatus } from '../store/slices/projectSlice';
import { ProjectForm } from '../components/projects/ProjectForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAppDispatch } from '../store/store';
import { showToast } from '../store/slices/uiSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);
  
  
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleEditProject = () => {
    setEditingProject(selectedProject);
    setProjectFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteProject = async () => {
    if (selectedProject) {
      await dispatch(deleteProject(selectedProject.id));
    }
    handleMenuClose();
  };

  const handleCompleteProject = async () => {
    if (selectedProject) {
      await dispatch(completeProject(selectedProject.id));
    }
    handleMenuClose();
  };

  const handleStatusChange = async (status: string) => {
    if (selectedProject) {
      await dispatch(updateProjectStatus({ id: selectedProject.id, status }));
    }
    handleMenuClose();
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectFormOpen(true);
  };

  const handleProjectFormSuccess = () => {
    setProjectFormOpen(false);
    setEditingProject(null);
    dispatch(fetchProjects());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'primary';
      case 'PLANNING': return 'warning';
      case 'PAUSED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon />;
      case 'IN_PROGRESS': return <PlayArrowIcon />;
      case 'PLANNING': return <EditIcon />;
      case 'PAUSED': return <PauseIcon />;
      default: return undefined;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeRemaining = (days: number) => {
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days remaining`;
  };

  const activeProjects = projects.filter(p => p.status !== 'COMPLETED');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const overdueProjects = projects.filter(p => p.isOverdue && p.status !== 'COMPLETED');

  if (loading && projects.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="h1">
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your career transition progress and manage your portfolio projects. Tip: Press Ctrl+K for the Command Palette.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateProject}>
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.12)' }}
            data-tour="project-stats"
          >
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h3" color="primary">
                {activeProjects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Portfolio projects in progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h3" color="success.main">
                {completedProjects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects finished
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h3" color="error.main">
                {overdueProjects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects past deadline
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h3" color="primary">
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All portfolio projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: 'background.paper', 
            border: '1px solid rgba(255, 255, 255, 0.12)' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Your Projects
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                data-tour="create-project"
              >
                Create Project
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Start building your portfolio by creating your first project"
                actionLabel="Create Your First Project"
                onAction={() => { handleCreateProject(); dispatch(showToast({ message: 'Create your first project', severity: 'info', durationMs: 2000 })); }}
              />
            ) : (
              <Grid container spacing={2} data-tour="project-cards">
                {projects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <Card sx={{ 
                      height: '100%',
                      backgroundColor: 'background.paper', 
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      position: 'relative',
                      ...(project.isOverdue && {
                        borderColor: 'error.main',
                        borderWidth: 2,
                      })
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h3" sx={{ flex: 1, mr: 1 }}>
                            {project.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, project)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Progress
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            color={project.isOverdue ? 'error' : 'primary'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {project.progress}% complete
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Chip
                            icon={getStatusIcon(project.status)}
                            label={project.status.replace('_', ' ')}
                            color={getStatusColor(project.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={formatTimeRemaining(project.timeRemaining)}
                            color={project.isOverdue ? 'error' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Due: {formatDate(project.targetEndDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.isArray(project.techStack) ? (
                            <>
                              {project.techStack.slice(0, 3).map((tech: string) => (
                                <Chip
                                  key={tech}
                                  label={tech}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {project.techStack.length > 3 && (
                                <Chip
                                  label={`+${project.techStack.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Technologies not available
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Project Form Dialog */}
      <ProjectForm
        open={projectFormOpen}
        onClose={() => setProjectFormOpen(false)}
        project={editingProject}
        onSuccess={handleProjectFormSuccess}
      />

      {/* Project Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditProject}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        {selectedProject?.status !== 'COMPLETED' && (
          <MenuItem onClick={handleCompleteProject}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        {selectedProject?.status === 'PLANNING' && (
          <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            Start Project
          </MenuItem>
        )}
        {selectedProject?.status === 'IN_PROGRESS' && (
          <MenuItem onClick={() => handleStatusChange('PAUSED')}>
            <PauseIcon sx={{ mr: 1 }} />
            Pause Project
          </MenuItem>
        )}
        {selectedProject?.status === 'PAUSED' && (
          <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            Resume Project
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteProject} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add project"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
        onClick={handleCreateProject}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default DashboardPage;