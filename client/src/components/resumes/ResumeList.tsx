import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchResumes,
  deleteResume,
  setDefaultResume,
  Resume,
} from '../../store/slices/resumeSlice';
import { AppDispatch } from '../../store/store';
import ResumeBuilder from './ResumeBuilder';

interface ResumeListProps {
  onResumeSelect?: (resume: Resume) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({ onResumeSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { resumes, loading, error } = useSelector((state: RootState) => state.resumes);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Export removed
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  // Export removed

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  const handleCreateResume = () => {
    setSelectedResume(null);
    setShowCreateDialog(true);
  };

  const handleEditResume = (resume: Resume) => {
    setSelectedResume(resume);
    setShowEditDialog(true);
  };

  const handleDeleteResume = (resume: Resume) => {
    setSelectedResume(resume);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedResume) {
      await dispatch(deleteResume(selectedResume.id));
      setShowDeleteDialog(false);
      setSelectedResume(null);
    }
  };

  const handleSetDefault = async (resume: Resume) => {
    await dispatch(setDefaultResume(resume.id));
  };

  // Export removed

  const handleSaveResume = (resume: Resume) => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    if (onResumeSelect) {
      onResumeSelect(resume);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Resumes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateResume}
          >
            Create New Resume
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resumes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No resumes yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first resume to get started with your job search
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateResume}
            >
              Create Your First Resume
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {resumes.map((resume) => (
              <Grid item xs={12} md={6} lg={4} key={resume.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    ...(resume.isDefault && {
                      border: '2px solid #1976d2',
                    })
                  }}
                >
                  {resume.isDefault && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        label="Default"
                        color="primary"
                        size="small"
                        icon={<StarIcon />}
                      />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {resume.versionName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Template: {resume.templateId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(resume.createdAt)}
                    </Typography>
                    
                    {resume.updatedAt !== resume.createdAt && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Updated: {formatDate(resume.updatedAt)}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton
                        onClick={() => handleEditResume(resume)}
                        color="primary"
                        title="Edit Resume"
                      >
                        <EditIcon />
                      </IconButton>
                      
                      {/* Export removed */}
                      
                      {!resume.isDefault && (
                        <IconButton
                          onClick={() => handleSetDefault(resume)}
                          color="primary"
                          title="Set as Default"
                        >
                          <StarBorderIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <IconButton
                      onClick={() => handleDeleteResume(resume)}
                      color="error"
                      title="Delete Resume"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Create Resume Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Create New Resume</DialogTitle>
        <DialogContent>
          <ResumeBuilder onSave={handleSaveResume} />
        </DialogContent>
      </Dialog>

      {/* Edit Resume Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Edit Resume</DialogTitle>
        <DialogContent>
          {selectedResume && (
            <ResumeBuilder resume={selectedResume} onSave={handleSaveResume} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedResume?.versionName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export dialog removed */}
    </Box>
  );
};

export default ResumeList; 