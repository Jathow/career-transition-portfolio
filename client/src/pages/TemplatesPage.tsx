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
  Tooltip,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  FormGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  School as LearningIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Assignment as ProjectIcon,
  Description as ResumeIcon,
  Web as PortfolioIcon,
  TrendingUp as MarketIcon,
  MonetizationOn as RevenueIcon,
  Psychology as MotivationIcon,
  Flag as GoalsIcon,
  EmojiEvents as AchievementsIcon,
  Feedback as FeedbackIcon,
  Settings as PreferencesIcon,
  Work as ApplicationsIcon,
  Event as InterviewsIcon,
  Schedule as TimeTrackingIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const TemplatesPage: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'project', 'resume', 'portfolio', 'market', 'revenue', 'monetization', 
    'analytics', 'motivation', 'goals', 'achievements', 'feedback', 
    'preferences', 'applications', 'interviews', 'notifications'
  ]);

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

  const importSections = [
    { key: 'project', label: 'Project Details', icon: <ProjectIcon />, description: 'Main project information, technical specs, and challenges' },
    { key: 'resume', label: 'Resume Content', icon: <ResumeIcon />, description: 'Professional resume entries and templates' },
    { key: 'portfolio', label: 'Portfolio Showcase', icon: <PortfolioIcon />, description: 'Portfolio presentation and project highlights' },
    { key: 'market', label: 'Market Research', icon: <MarketIcon />, description: 'Competitor analysis and market insights' },
    { key: 'revenue', label: 'Revenue Metrics', icon: <RevenueIcon />, description: 'Financial projections and revenue tracking' },
    { key: 'monetization', label: 'Monetization Strategies', icon: <MonetizationOn />, description: 'Business models and pricing strategies' },
    { key: 'analytics', label: 'Project Analytics', icon: <TrendingUp />, description: 'Performance metrics and success indicators' },
    { key: 'motivation', label: 'Motivation & Progress', icon: <Psychology />, description: 'Daily logs, mood tracking, and reflections' },
    { key: 'goals', label: 'Goals & Milestones', icon: <Flag />, description: 'Goal setting and progress tracking' },
    { key: 'achievements', label: 'Achievements', icon: <EmojiEvents />, description: 'Milestones, badges, and accomplishments' },
    { key: 'feedback', label: 'Motivational Feedback', icon: <Feedback />, description: 'Encouragement and guidance messages' },
    { key: 'preferences', label: 'User Preferences', icon: <Settings />, description: 'Platform settings and customization' },
    { key: 'applications', label: 'Job Applications', icon: <Work />, description: 'Application tracking and company research' },
    { key: 'interviews', label: 'Interviews', icon: <Event />, description: 'Interview scheduling and preparation notes' },
    { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, description: 'Alerts, reminders, and system notifications' },
  ];

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
      const response = await fetch('/api/templates/import-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId: 'career-portfolio-platform',
          importSections: selectedSections,
          customProjectName: customProjectName || undefined
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          setImportDialogOpen(false);
          // Redirect to projects page
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        console.error('Import failed:', result.error);
        alert(`Import failed: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSectionToggle = (sectionKey: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedSections(importSections.map(s => s.key));
  };

  const handleSelectNone = () => {
    setSelectedSections([]);
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
                Import Template
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Career Portfolio Platform Template
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
            Select which sections you'd like to import and customize your project name.
          </Typography>

          <TextField
            fullWidth
            label="Custom Project Name (optional)"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            placeholder="My Career Portfolio Platform"
            sx={{ mb: 3 }}
            helperText="Leave blank to use the original project name"
          />

          <Typography variant="h6" gutterBottom>
            Import Sections
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
              Select All
            </Button>
            <Button size="small" onClick={handleSelectNone}>
              Select None
            </Button>
          </Box>

          <FormGroup>
            <Grid container spacing={2}>
              {importSections.map((section) => (
                <Grid item xs={12} sm={6} key={section.key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSections.includes(section.key)}
                        onChange={() => handleSectionToggle(section.key)}
                      />
                    }
                    label={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {section.icon}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {section.label}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Template imported successfully! Redirecting to dashboard...
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
            disabled={importing || selectedSections.length === 0}
            startIcon={importing ? <LinearProgress /> : <CodeIcon />}
          >
            {importing ? 'Importing...' : 'Import Template'}
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
            Import Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;