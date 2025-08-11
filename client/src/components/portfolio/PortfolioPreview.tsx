import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  GitHub,
  Launch,
  Business,
  TrendingUp,
  Visibility,
  Phone,
  Email,
  LinkedIn,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { generatePortfolioContent, PortfolioContent } from '../../store/slices/portfolioSlice';

interface PortfolioPreviewProps {
  contentOverride?: PortfolioContent | null;
  hideControls?: boolean;
  suppressAutoGenerate?: boolean;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ contentOverride, hideControls = false, suppressAutoGenerate = false }) => {
  const dispatch = useAppDispatch();
  const { content, loading } = useAppSelector((state) => state.portfolio);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    if (!suppressAutoGenerate && !content && !contentOverride) {
      dispatch(generatePortfolioContent({
        includeCompletedProjects: true,
        includeResume: true,
        includeAnalytics: false,
      }));
    }
  }, [dispatch, content, contentOverride, suppressAutoGenerate]);

  const contentData = contentOverride || content;

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };



  const getTechStackArray = (techStack: string) => {
    return techStack.split(',').map(tech => tech.trim());
  };

  const getLink = (raw?: string) => {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  if (loading && !contentData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contentData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Preview
          </Typography>
          <Alert severity="info">
            Generate portfolio content to see a preview
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Preview Controls */}
      {!hideControls && (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Preview</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Desktop View">
                <IconButton
                  onClick={() => setPreviewMode('desktop')}
                  color={previewMode === 'desktop' ? 'primary' : 'default'}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title="Tablet View">
                <IconButton
                  onClick={() => setPreviewMode('tablet')}
                  color={previewMode === 'tablet' ? 'primary' : 'default'}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mobile View">
                <IconButton
                  onClick={() => setPreviewMode('mobile')}
                  color={previewMode === 'mobile' ? 'primary' : 'default'}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Preview how your portfolio will appear to visitors
          </Typography>
        </CardContent>
      </Card>
      )}

      {/* Portfolio Preview */}
      <Box
        sx={{
          width: getPreviewWidth(),
          mx: 'auto',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: (theme) => theme.palette.background.paper,
          minHeight: '600px',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" gutterBottom>
            {contentData.portfolio.title}
          </Typography>
          {contentData.portfolio.subtitle && (
            <Typography variant="h6" sx={{ mb: 2 }}>
              {contentData.portfolio.subtitle}
            </Typography>
          )}
          {contentData.portfolio.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {contentData.portfolio.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Email />}
              href={`mailto:${contentData.user.email}`}
            >
              Contact
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Phone />}
            >
              Resume
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* About Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              About
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Hi, I'm {contentData.user.firstName} {contentData.user.lastName}
              {contentData.user.targetJobTitle && (
                <span>, a {contentData.user.targetJobTitle}</span>
              )}
              . I'm passionate about creating innovative solutions and building impactful applications.
            </Typography>
          </Box>

          {/* Projects Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Projects
            </Typography>
            <Grid container spacing={3}>
              {contentData.projects.map((project) => (
                <Grid item xs={12} md={6} key={project.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        {getTechStackArray(project.techStack).map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {project.repositoryUrl && (
                          <Button
                            size="small"
                            startIcon={<GitHub />}
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Code
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button
                            size="small"
                            startIcon={<Launch />}
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live Demo
                          </Button>
                        )}
                      </Box>

                      {project.revenueTracking && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="success.contrastText">
                            <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            Revenue Tracking Enabled
                          </Typography>
                        </Box>
                      )}

                      {project.marketResearch && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="info.contrastText">
                            <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            Market Research Available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Skills Section */}
          {contentData.resume?.content?.skills && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {contentData.resume.content.skills.map((skill: string, index: number) => (
                  <Chip
                    key={index}
                    label={skill}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Contact Section */}
          <Box>
            <Typography variant="h4" gutterBottom>
              Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Get in Touch
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Email sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    {contentData.user.email}
                  </Typography>
                  <Typography variant="body2">
                    I'm always open to discussing new opportunities and collaborations.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Connect
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {getLink(contentData.resume?.content?.personalInfo?.linkedin) && (
                      <Button
                        size="small"
                        startIcon={<LinkedIn />}
                        variant="outlined"
                        href={getLink(contentData.resume?.content?.personalInfo?.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </Button>
                    )}
                    {getLink(contentData.resume?.content?.personalInfo?.github) && (
                      <Button
                        size="small"
                        startIcon={<GitHub />}
                        variant="outlined"
                        href={getLink(contentData.resume?.content?.personalInfo?.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.06)' : 'grey.100',
            p: 2,
            textAlign: 'center',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} {contentData.user.firstName} {contentData.user.lastName}. 
            All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioPreview; 