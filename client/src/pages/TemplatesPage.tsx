import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Check as CheckIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { templatesAPI } from '../services/api';

const TemplatesPage: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [customImportDialogOpen, setCustomImportDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Template data (in a real app, this would come from the API)
  const template = {
    id: 'career-portfolio-platform',
    title: 'Career Portfolio Platform',
    description: 'A comprehensive full-stack web application for managing career transitions and building developer portfolios. This project demonstrates modern web development practices with React, Node.js, TypeScript, and PostgreSQL.',
    category: 'Full-Stack Development',
    duration: '6 days',
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Material-UI', 'Redux', 'Prisma'],
    features: [
      'User authentication and authorization',
      'Project management and tracking',
      'Resume builder with templates',
      'Job application tracking',
      'Interview preparation tools',
      'Portfolio showcase',
      'Revenue tracking for freelance work',
      'Market analysis tools',
      'Motivation and goal tracking',
      'Time tracking and productivity metrics'
    ],
    metrics: {
      linesOfCode: 15000,
      components: 45,
      apiEndpoints: 25,
      databaseTables: 12,
      testCoverage: 85
    },
    downloadUrl: '/templates/career-portfolio-platform-project.json'
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setFileError('Please select a JSON file');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setFileError(null);
    }
  };

  const handleCustomImport = async () => {
    if (!selectedFile) {
      setFileError('Please select a file');
      return;
    }

    setImporting(true);
    try {
      const fileContent = await selectedFile.text();
      const templateData = JSON.parse(fileContent);
      
      const response = await templatesAPI.importCustomTemplate({
        templateData,
        customProjectName: customProjectName || undefined
      });
      
      if (response.data.success) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          setCustomImportDialogOpen(false);
          setSelectedFile(null);
          setCustomProjectName('');
          // Redirect to projects page
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        console.error('Custom import failed:', response.data.error);
        alert(`Import failed: ${response.data.error.message}`);
      }
    } catch (error: any) {
      console.error('Custom import failed:', error);
      if (error.name === 'SyntaxError') {
        setFileError('Invalid JSON file. Please check the file format.');
      } else {
        const errorMessage = error.response?.data?.error?.message || 'Import failed. Please try again.';
        alert(errorMessage);
      }
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
                  <Typography variant="body2" color="text.secondary">Test Coverage</Typography>
                  <Typography variant="h6">{template.metrics.testCoverage}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setImportDialogOpen(true)}
                  fullWidth
                >
                  Import Template
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setCustomImportDialogOpen(true)}
                  fullWidth
                >
                  Import Custom Template
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  fullWidth
                >
                  Download Template
                </Button>
                
                <Button
                  variant="text"
                  onClick={handlePreview}
                  fullWidth
                >
                  Preview Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Career Portfolio Platform Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            This will import a complete Career Portfolio Platform project with all features, 
            documentation, and sample data to help you get started quickly.
          </Typography>
          
          <TextField
            fullWidth
            label="Custom Project Name (Optional)"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            placeholder="My Career Portfolio Platform"
            margin="normal"
          />
          
          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Template imported successfully! Redirecting to dashboard...
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={importing}
            startIcon={importing ? <CircularProgress size={20} /> : null}
          >
            {importing ? 'Importing...' : 'Import Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Import Dialog */}
      <Dialog open={customImportDialogOpen} onClose={() => setCustomImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Custom Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a custom template JSON file to import your own project template.
          </Typography>
          
          <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center', mb: 2 }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="template-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="template-file-input">
              <Button
                component="span"
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                Select JSON Template File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            {fileError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {fileError}
              </Alert>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Custom Project Name (Optional)"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            placeholder="My Custom Project"
            margin="normal"
          />
          
          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Custom template imported successfully! Redirecting to dashboard...
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCustomImport} 
            variant="contained" 
            disabled={importing || !selectedFile}
            startIcon={importing ? <CircularProgress size={20} /> : null}
          >
            {importing ? 'Importing...' : 'Import Custom Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(template, null, 2)}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;