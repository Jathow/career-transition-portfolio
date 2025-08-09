import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { api } from '../../services/api';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';

const FeedbackWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        message,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      });
      setOpen(false);
      setMessage('');
      dispatch(showToast({ message: 'Thanks for your feedback!', severity: 'success' }));
    } catch (e) {
      dispatch(showToast({ message: 'Failed to send feedback', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title="Send feedback">
        <Fab color="primary" aria-label="Send feedback" size="small" onClick={() => setOpen(true)} sx={{ position: 'fixed', bottom: 88, right: 16 }}>
          <FeedbackIcon fontSize="small" />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            placeholder="What’s working well? What’s missing? Any bugs?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !message.trim()}>Send</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackWidget;


