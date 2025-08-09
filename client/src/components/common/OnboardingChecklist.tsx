import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Checkbox, Typography, IconButton, Tooltip, Button, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface OnboardingStatus {
  hasProject: boolean;
  hasApplication: boolean;
  hasResume: boolean;
  hasGoal?: boolean;
}

interface OnboardingChecklistProps {
  status: OnboardingStatus;
  onCreateProject?: () => void;
  onCreateApplication?: () => void;
  onCreateResume?: () => void;
  onCreateGoal?: () => void;
}

const STORAGE_KEY = 'onboarding-checklist-dismissed';

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ status, onCreateProject, onCreateApplication, onCreateResume, onCreateGoal }) => {
  const [dismissed, setDismissed] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const items = useMemo(() => ([
    { key: 'project', label: 'Create your first project', done: status.hasProject, action: onCreateProject },
    { key: 'application', label: 'Add your first job application', done: status.hasApplication, action: onCreateApplication },
    { key: 'resume', label: 'Create a resume version', done: status.hasResume, action: onCreateResume },
    { key: 'goal', label: 'Set a motivation goal (optional)', done: !!status.hasGoal, action: onCreateGoal },
  ]), [status, onCreateProject, onCreateApplication, onCreateResume, onCreateGoal]);

  const remaining = items.filter(i => !i.done).length;
  const allDone = remaining === 0;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ py: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Get started checklist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Complete these quick steps to hit your first “aha.” Remaining: {remaining}
            </Typography>

            <Stack spacing={0.75}>
              {items.map(item => (
                <Box key={item.key} display="flex" alignItems="center" gap={1}>
                  <Checkbox checked={item.done} size="small" inputProps={{ 'aria-label': item.label }} />
                  <Typography variant="body2" sx={{ textDecoration: item.done ? 'line-through' : 'none', flex: 1 }}>
                    {item.label}
                  </Typography>
                  {!item.done && item.action && (
                    <Button size="small" variant="outlined" onClick={item.action}>
                      Do it
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          <Tooltip title="Dismiss">
            <IconButton size="small" onClick={handleDismiss} aria-label="Dismiss onboarding checklist">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;


