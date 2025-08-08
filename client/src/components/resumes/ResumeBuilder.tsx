import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchTemplates,
  createResume,
  updateResume,
  generateResumeContent,
  ResumeContent,
  Resume,
} from '../../store/slices/resumeSlice';
import { AppDispatch } from '../../store/store';

interface ResumeBuilderProps {
  resume?: Resume;
  onSave?: (resume: Resume) => void;
  _onCancel?: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resume, onSave, _onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading, error, generatedContent } = useSelector(
    (state: RootState) => state.resumes
  );

  const [content, setContent] = useState<ResumeContent>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    experience: [],
    projects: [],
    skills: {
      technical: [],
      soft: [],
    },
    education: [],
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [versionName, setVersionName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Export functionality removed

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (resume) {
      setContent(JSON.parse(resume.content));
      setSelectedTemplate(resume.templateId);
      setVersionName(resume.versionName);
      setIsDefault(resume.isDefault);
    }
  }, [resume]);

  useEffect(() => {
    if (generatedContent) {
      setContent(generatedContent);
    }
  }, [generatedContent]);

  const handleGenerateContent = () => {
    dispatch(generateResumeContent());
  };

  const handleSave = async () => {
    if (!selectedTemplate || !versionName) {
      return;
    }

    const resumeData = {
      versionName,
      templateId: selectedTemplate,
      content,
      isDefault,
    };

    if (resume) {
      await dispatch(updateResume({ id: resume.id, data: resumeData }));
    } else {
      await dispatch(createResume(resumeData));
    }

    if (onSave) {
      // This would need to be updated to get the actual saved resume
      onSave(resume!);
    }
  };

  // Export functionality removed

  const updatePersonalInfo = (field: keyof ResumeContent['personalInfo'], value: string) => {
    setContent(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    setContent(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: [''],
          technologies: [],
        },
      ],
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setContent(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setContent(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: '',
          description: '',
          technologies: [],
          repositoryUrl: '',
          liveUrl: '',
        },
      ],
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
  };

  const removeProject = (index: number) => {
    setContent(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addSkill = (category: 'technical' | 'soft', skill: string) => {
    if (skill.trim()) {
      setContent(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [category]: [...prev.skills[category], skill.trim()],
        },
      }));
    }
  };

  const removeSkill = (category: 'technical' | 'soft', skill: string) => {
    setContent(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter(s => s !== skill),
      },
    }));
  };

  const addEducation = () => {
    setContent(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          field: '',
          graduationDate: '',
          gpa: '',
        },
      ],
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setContent(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h1">
            {resume ? 'Edit Resume' : 'Create New Resume'}
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!selectedTemplate || !versionName}
            >
              Save Resume
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

          <Grid container spacing={2}>
          {/* Left Column - Form */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Basic Information */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Basic Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={content.personalInfo.firstName}
                        onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={content.personalInfo.lastName}
                        onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={content.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={content.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={content.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="LinkedIn"
                        value={content.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="GitHub"
                        value={content.personalInfo.github}
                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Summary */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Professional Summary</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    label="Summary"
                    multiline
                    rows={4}
                    value={content.summary}
                    onChange={(e) => setContent(prev => ({ ...prev, summary: e.target.value }))}
                    margin="normal"
                    helperText="Write a compelling summary of your professional background and career goals"
                  />
                </AccordionDetails>
              </Accordion>

              {/* Experience */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <WorkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Work Experience</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {content.experience.map((exp, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Position"
                              value={exp.position}
                              onChange={(e) => updateExperience(index, 'position', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Start Date"
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                              margin="normal"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="End Date"
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              margin="normal"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              multiline
                              rows={3}
                              value={exp.description.join('\n')}
                              onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n').filter(line => line.trim()))}
                              margin="normal"
                              helperText="Enter each bullet point on a new line"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Technologies"
                              value={exp.technologies.join(', ')}
                              onChange={(e) => updateExperience(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                              margin="normal"
                              helperText="Separate technologies with commas"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => removeExperience(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addExperience}
                    variant="outlined"
                    fullWidth
                  >
                    Add Experience
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* Projects */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <CodeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Projects</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {content.projects.map((project, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Project Title"
                              value={project.title}
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              multiline
                              rows={3}
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Technologies"
                              value={project.technologies.join(', ')}
                              onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                              margin="normal"
                              helperText="Separate technologies with commas"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Repository URL"
                              value={project.repositoryUrl}
                              onChange={(e) => updateProject(index, 'repositoryUrl', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Live Demo URL"
                              value={project.liveUrl}
                              onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => removeProject(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addProject}
                    variant="outlined"
                    fullWidth
                  >
                    Add Project
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* Skills */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <PsychologyIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Skills</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Technical Skills
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {content.skills.technical.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => removeSkill('technical', skill)}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                      <TextField
                        fullWidth
                        label="Add Technical Skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill('technical', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Soft Skills
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {content.skills.soft.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => removeSkill('soft', skill)}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                      <TextField
                        fullWidth
                        label="Add Soft Skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill('soft', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Education */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Education</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {content.education.map((edu, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Field of Study"
                              value={edu.field}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Graduation Date"
                              type="date"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                              margin="normal"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="GPA (Optional)"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => removeEducation(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addEducation}
                    variant="outlined"
                    fullWidth
                  >
                    Add Education
                  </Button>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>

          {/* Right Column - Settings and Preview */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Resume Settings */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resume Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Version Name"
                        value={versionName}
                        onChange={(e) => setVersionName(e.target.value)}
                        margin="normal"
                        helperText="Give your resume version a descriptive name"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Template</InputLabel>
                        <Select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          label="Template"
                        >
                          {templates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                              <Box>
                                <Typography variant="subtitle1">{template.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {template.description}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={handleGenerateContent}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Generate from Projects
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Template Preview */}
              {selectedTemplate && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Template Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {templates.find(t => t.id === selectedTemplate)?.description}
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        {content.personalInfo.firstName} {content.personalInfo.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {content.personalInfo.email}
                      </Typography>
                      {content.personalInfo.phone && (
                        <Typography variant="body2" color="text.secondary">
                          {content.personalInfo.phone}
                        </Typography>
                      )}
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Summary
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {content.summary || 'Your professional summary will appear here...'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Export dialog removed */}
    </Box>
  );
};

export default ResumeBuilder; 