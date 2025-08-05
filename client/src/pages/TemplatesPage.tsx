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
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  School as LearningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const TemplatesPage: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

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
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call your import API
      const response = await fetch('/api/projects/import-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId: 'career-portfolio-platform',
          importSections: ['project', 'resume', 'portfolio', 'market', 'motivation']
        })
      });
      
      if (response.ok) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          // Redirect to projects page
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('Import failed:', error);
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
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Download and import professional project templates to jumpstart your portfolio. 
        These templates include complete documentation, resume entries, and business analysis.
      </Typography>

      {importSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Template imported successfully! Redirecting to your dashboard...
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {template.title}
                </Typography>
                <Chip 
                  label="Featured" 
                  color="primary" 
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {template.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={template.category} 
                  variant="outlined" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  label={`${template.duration} project`} 
                  variant="outlined" 
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Technologies:
              </Typography>
              <Box sx={{ mb: 2 }}>
                {template.technologies.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                What's Included:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {template.features.map((feature, index) => (
                  <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                    {feature}
                  </Typography>
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Project Metrics:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Lines of Code:</strong> {template.metrics.linesOfCode}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Components:</strong> {template.metrics.components}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>API Endpoints:</strong> {template.metrics.apiEndpoints}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Performance:</strong> {template.metrics.performanceScore}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                startIcon={importing ? null : <DownloadIcon />}
                onClick={handleImport}
                disabled={importing}
                sx={{ mr: 1 }}
              >
                {importing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ width: 100, height: 4 }} />
                    Importing...
                  </Box>
                ) : (
                  'Import Template'
                )}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download JSON
              </Button>
              
              <Tooltip title="Preview template content">
                <IconButton onClick={handlePreview}>
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>

        {/* Coming Soon Templates */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ height: '100%', opacity: 0.6 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                E-commerce App
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mobile-first e-commerce application with payment integration.
              </Typography>
              <Chip label="Coming Soon" size="small" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ height: '100%', opacity: 0.6 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Analytics dashboard with data visualization and reporting.
              </Typography>
              <Chip label="Coming Soon" size="small" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Template Preview: {template.title}
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon /> Project Overview
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Complete full-stack web application with modern React frontend, Node.js backend, 
              and PostgreSQL database. Includes authentication, real-time features, and deployment optimization.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon /> Business Analysis
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Comprehensive market analysis with competitor research, revenue projections, 
              and 3-year growth strategy. Includes freemium pricing model and enterprise features.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon /> Development Journey
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Daily progress logs showing real development challenges, breakthroughs, and learning outcomes. 
              Includes mood tracking and reflection notes.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LearningIcon /> Learning Outcomes
            </Typography>
            <Typography variant="body2">
              Key technical skills developed: CSS Grid mastery, Docker optimization, 
              deployment strategies, and modern UI/UX design patterns.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={handleImport}>
            Import This Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;