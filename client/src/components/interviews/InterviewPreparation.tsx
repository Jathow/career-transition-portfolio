import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

interface PreparationMaterials {
  companyInfo: string;
  commonQuestions: string[];
  technicalTopics: string[];
  behavioralQuestions: string[];
}

interface InterviewPreparationProps {
  companyName: string;
  _jobTitle?: string;
  _interviewType?: string;
}

const InterviewPreparation: React.FC<InterviewPreparationProps> = ({ 
  companyName, 
  _jobTitle, 
  _interviewType 
}) => {
  const [materials, setMaterials] = useState<PreparationMaterials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPreparationMaterials();
  }, [companyName]);

  const fetchPreparationMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/interviews/preparation/${encodeURIComponent(companyName)}`);
      setMaterials(response.data.data);
    } catch (err) {
      setError('Failed to fetch preparation materials');
      console.error('Error fetching preparation materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const getProgressPercentage = () => {
    if (!materials) return 0;
    const totalItems = materials.commonQuestions.length + 
                      materials.technicalTopics.length + 
                      materials.behavioralQuestions.length;
    return Math.round((completedItems.size / totalItems) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!materials) {
    return (
      <Alert severity="info">
        No preparation materials available for this company.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Interview Preparation
        </Typography>
        <Chip 
          label={`${getProgressPercentage()}% Complete`}
          color={getProgressPercentage() >= 80 ? 'success' : 'primary'}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Company Research */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BusinessIcon color="primary" />
                <Typography variant="h6">Company Research</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {materials.companyInfo}
              </Typography>

              <TextField
                fullWidth
                label="Research Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your research notes about the company..."
                variant="outlined"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Preparation Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Preparation Checklist
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Common Questions ({completedItems.size}/{materials.commonQuestions.length} completed)
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Box flex={1} height={8} bgcolor="grey.200" borderRadius={4} overflow="hidden">
                    <Box 
                      width={`${(completedItems.size / materials.commonQuestions.length) * 100}%`}
                      height="100%"
                      bgcolor="primary.main"
                    />
                  </Box>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Technical Topics ({Array.from(completedItems).filter(id => id.startsWith('tech')).length}/{materials.technicalTopics.length} completed)
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Box flex={1} height={8} bgcolor="grey.200" borderRadius={4} overflow="hidden">
                    <Box 
                      width={`${(Array.from(completedItems).filter(id => id.startsWith('tech')).length / materials.technicalTopics.length) * 100}%`}
                      height="100%"
                      bgcolor="secondary.main"
                    />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Behavioral Questions ({Array.from(completedItems).filter(id => id.startsWith('behavioral')).length}/{materials.behavioralQuestions.length} completed)
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Box flex={1} height={8} bgcolor="grey.200" borderRadius={4} overflow="hidden">
                    <Box 
                      width={`${(Array.from(completedItems).filter(id => id.startsWith('behavioral')).length / materials.behavioralQuestions.length) * 100}%`}
                      height="100%"
                      bgcolor="success.main"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Common Questions */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <QuestionAnswerIcon color="primary" />
                <Typography variant="h6">Common Interview Questions</Typography>
                <Chip 
                  label={`${completedItems.size}/${materials.commonQuestions.length}`}
                  size="small"
                  color="primary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {materials.commonQuestions.map((question, index) => (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => toggleCompleted(`common-${index}`)}
                    sx={{
                      backgroundColor: completedItems.has(`common-${index}`) ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {completedItems.has(`common-${index}`) ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <QuestionAnswerIcon color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={question}
                      sx={{
                        textDecoration: completedItems.has(`common-${index}`) ? 'line-through' : 'none'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Technical Topics */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <CodeIcon color="primary" />
                <Typography variant="h6">Technical Topics to Review</Typography>
                <Chip 
                  label={`${Array.from(completedItems).filter(id => id.startsWith('tech')).length}/${materials.technicalTopics.length}`}
                  size="small"
                  color="secondary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {materials.technicalTopics.map((topic, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: completedItems.has(`tech-${index}`) ? 'success.light' : 'background.paper',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => toggleCompleted(`tech-${index}`)}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {completedItems.has(`tech-${index}`) ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CodeIcon color="action" />
                        )}
                        <Typography 
                          variant="body2"
                          sx={{
                            textDecoration: completedItems.has(`tech-${index}`) ? 'line-through' : 'none'
                          }}
                        >
                          {topic}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Behavioral Questions */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <PsychologyIcon color="primary" />
                <Typography variant="h6">Behavioral Questions</Typography>
                <Chip 
                  label={`${Array.from(completedItems).filter(id => id.startsWith('behavioral')).length}/${materials.behavioralQuestions.length}`}
                  size="small"
                  color="success"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {materials.behavioralQuestions.map((question, index) => (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => toggleCompleted(`behavioral-${index}`)}
                    sx={{
                      backgroundColor: completedItems.has(`behavioral-${index}`) ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {completedItems.has(`behavioral-${index}`) ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <PsychologyIcon color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={question}
                      sx={{
                        textDecoration: completedItems.has(`behavioral-${index}`) ? 'line-through' : 'none'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Interview Tips */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Interview Tips for {_interviewType || 'Your Interview'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Before the Interview
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Research the company thoroughly" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Practice your responses to common questions" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Prepare questions to ask the interviewer" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Test your technology (for video interviews)" />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    During the Interview
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Maintain good eye contact and body language" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Listen carefully and ask clarifying questions" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Use the STAR method for behavioral questions" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Show enthusiasm and genuine interest" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterviewPreparation; 