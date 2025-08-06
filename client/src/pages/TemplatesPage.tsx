import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { templatesAPI } from '../services/api';

const TemplatesPage: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('');

  const template = {
    title: "Career Portfolio Platform",
    description: "A comprehensive full-stack web application example showing best practices for project documentation, technical challenges, and professional presentation.",
    category: "Full-Stack Development",
    duration: "6 days",
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Railway"],
    features: [
      "Complete project documentation",
      "Resume-ready achievements",
      "Portfolio showcase content",
      "Market analysis and revenue projections",
      "Daily progress logs and reflections"
    ],
    metrics: {
      linesOfCode: "15,000+",
      components: "45+",
      apiEndpoints: "25+",
      performanceScore: "95+"
    },
    downloadUrl: "/templates/career-portfolio-platform-project.json",
    previewUrl: "/templates/career-portfolio-platform-preview.html"
  };

  const handleDownload = () => {
    // Create download link for the JSON file
    const link = document.createElement('a');
    link.href = template.downloadUrl;
    link.download = 'career-portfolio-platform-project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const response = await templatesAPI.importProject({
        customProjectName: customProjectName || undefined
      });
      
      if (response.data.success) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          setImportDialogOpen(false);
          // Redirect to projects page
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        console.error('Import failed:', response.data.error);
        alert(`Import failed: ${response.data.error.message}`);
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Authentication error - try to refresh auth status
        try {
          // Attempt to check auth status
          const token = localStorage.getItem('token');
          if (token) {
            // Token exists but might be expired, redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
          }
        } catch (authError) {
          console.error('Auth check failed:', authError);
        }
      }
      
      const errorMessage = error.response?.data?.error?.message || 'Import failed. Please try again.';
      alert(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Project Templates
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Import comprehensive project templates to jumpstart your career portfolio. 
        Each template includes complete documentation, technical specifications, and professional presentation materials.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {template.title}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {template.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip label={template.category} color="primary" sx={{ mr: 1 }} />
                <Chip label={`${template.duration} duration`} variant="outlined" sx={{ mr: 1 }} />
                <Chip label={`${template.metrics.linesOfCode} LOC`} variant="outlined" />
              </Box>

              <Typography variant="h6" gutterBottom>
                Technologies Used
              </Typography>
              <Box sx={{ mb: 2 }}>
                {template.technologies.map((tech, index) => (
                  <Chip 
                    key={index} 
                    label={tech} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <List dense>
                {template.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Lines of Code</Typography>
                  <Typography variant="h6">{template.metrics.linesOfCode}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Components</Typography>
                  <Typography variant="h6">{template.metrics.components}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">API Endpoints</Typography>
                  <Typography variant="h6">{template.metrics.apiEndpoints}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Performance</Typography>
                  <Typography variant="h6">{template.metrics.performanceScore}</Typography>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download Template
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
              >
                Preview
              </Button>
              
              <Button
                variant="contained"
                startIcon={<CodeIcon />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ ml: 'auto' }}
              >
                Import Project
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Benefits
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Complete project documentation" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Resume-ready achievements" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Portfolio showcase content" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Market analysis & revenue projections" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Daily progress logs & reflections" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Import Career Portfolio Platform Project
          <IconButton
            aria-label="close"
            onClick={() => setImportDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            This will import the complete Career Portfolio Platform project with all its data, including:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Project details and technical specifications" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Resume content and templates" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Portfolio showcase materials" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Market research and revenue metrics" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Motivation logs and progress tracking" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Goals, achievements, and feedback" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Job applications and interviews" />
            </ListItem>
          </List>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can customize the project name below, or leave it blank to use the original name.
          </Typography>

          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Project imported successfully! Redirecting to dashboard...
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing}
            startIcon={importing ? <LinearProgress /> : <CodeIcon />}
          >
            {importing ? 'Importing...' : 'Import Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Template Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            This template includes comprehensive documentation for a full-stack career portfolio platform.
            It demonstrates best practices for project documentation, technical challenges, and professional presentation.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            What's Included:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Project Documentation
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Complete technical specifications" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Challenge descriptions and solutions" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Learning outcomes and metrics" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Technology stack and features" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Professional Content
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Resume-ready project entries" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Portfolio showcase materials" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Market analysis and revenue projections" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Progress tracking and motivation logs" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreviewOpen(false);
              setImportDialogOpen(true);
            }}
          >
            Import Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;