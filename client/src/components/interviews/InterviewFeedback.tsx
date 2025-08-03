import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Rating,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

interface Interview {
  id: string;
  interviewType: string;
  scheduledDate: string;
  duration: number;
  interviewerName?: string;
  questionsAsked: string;
  feedback?: string;
  outcome: string;
  application: {
    id: string;
    companyName: string;
    jobTitle: string;
  };
}

interface InterviewFeedbackProps {
  interview: Interview;
  onFeedbackUpdate?: (interview: Interview) => void;
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ interview, onFeedbackUpdate }) => {
  const [feedback, setFeedback] = useState(interview.feedback || '');
  const [questionsAsked, setQuestionsAsked] = useState(interview.questionsAsked || '');
  const [outcome, setOutcome] = useState(interview.outcome);
  const [overallRating, setOverallRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveFeedback = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (feedback !== interview.feedback) {
        await api.post(`/interviews/${interview.id}/feedback`, { feedback });
      }
      
      if (questionsAsked !== interview.questionsAsked) {
        await api.put(`/interviews/${interview.id}`, { questionsAsked });
      }
      
      if (outcome !== interview.outcome) {
        await api.put(`/interviews/${interview.id}/outcome`, { outcome });
      }

      setSuccess('Feedback saved successfully');
      setIsEditing(false);
      
      // Refresh the interview data
      const response = await api.get(`/interviews/${interview.id}`);
      onFeedbackUpdate?.(response.data.data);
    } catch (err) {
      setError('Failed to save feedback');
      console.error('Error saving feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'PASSED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <CancelIcon color="error" />;
      case 'CANCELLED':
        return <ScheduleIcon color="warning" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case 'PASSED':
        return 'Passed';
      case 'FAILED':
        return 'Failed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PENDING':
        return 'Pending';
      default:
        return outcome;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Interview Feedback
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            icon={getOutcomeIcon(outcome)}
            label={getOutcomeText(outcome)}
            color={getOutcomeColor(outcome) as any}
          />
          <Button
            variant={isEditing ? "contained" : "outlined"}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={isEditing ? handleSaveFeedback : () => setIsEditing(true)}
            disabled={loading}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Interview Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interview Details
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Company"
                    secondary={interview.application.companyName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Position"
                    secondary={interview.application.jobTitle}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Interview Type"
                    secondary={interview.interviewType}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Interviewer"
                    secondary={interview.interviewerName || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Duration"
                    secondary={`${interview.duration} minutes`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Outcome and Ratings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interview Outcome
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={outcome}
                  label="Outcome"
                  onChange={(e) => setOutcome(e.target.value)}
                  disabled={!isEditing}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PASSED">Passed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall Experience
                </Typography>
                <Rating
                  value={overallRating}
                  onChange={(_, value) => setOverallRating(value || 0)}
                  disabled={!isEditing}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Interview Difficulty
                </Typography>
                <Rating
                  value={difficultyRating}
                  onChange={(_, value) => setDifficultyRating(value || 0)}
                  disabled={!isEditing}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Questions Asked */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Questions Asked During Interview
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={questionsAsked}
                onChange={(e) => setQuestionsAsked(e.target.value)}
                placeholder="Record the questions that were asked during the interview..."
                disabled={!isEditing}
                variant="outlined"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This helps you prepare for future interviews and track common question patterns.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feedback */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interview Feedback & Notes
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={8}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add your feedback, notes, and observations about the interview..."
                disabled={!isEditing}
                variant="outlined"
              />
              
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Consider including:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="What went well"
                      secondary="Strengths you demonstrated and positive aspects of the interview"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Areas for improvement"
                      secondary="Questions you struggled with or areas you could have prepared better"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Key learnings"
                      secondary="Insights about the company, role, or interview process"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Follow-up actions"
                      secondary="Next steps, thank you notes, or additional preparation needed"
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        {isEditing && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setFeedback(interview.feedback || '');
                    setQuestionsAsked(interview.questionsAsked || '');
                    setOutcome(interview.outcome);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveFeedback}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : 'Save Feedback'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default InterviewFeedback; 