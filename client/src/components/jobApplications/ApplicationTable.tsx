import React, { useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  TextField,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import {
  JobApplication,
  updateApplication,
  updateApplicationStatus,
} from '../../store/slices/jobApplicationSlice';

type VisibleColumns = {
  company: boolean;
  title: boolean;
  status: boolean;
  applied: boolean;
  followUp: boolean;
  notes: boolean;
  resume: boolean;
  actions: boolean;
};

interface ApplicationTableProps {
  applications: JobApplication[];
  onView: (app: JobApplication) => void;
  onEdit: (app: JobApplication) => void;
  visible?: Partial<VisibleColumns>;
}

const DEFAULT_COLUMNS: VisibleColumns = {
  company: true,
  title: true,
  status: true,
  applied: true,
  followUp: true,
  notes: true,
  resume: false,
  actions: true,
};

const STATUS_OPTIONS = ['APPLIED','SCREENING','INTERVIEW','OFFER','REJECTED','WITHDRAWN'];

const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, onView, onEdit, visible }) => {
  const dispatch = useAppDispatch();
  const columns = useMemo(() => ({ ...DEFAULT_COLUMNS, ...visible }), [visible]);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [followUpDraft, setFollowUpDraft] = useState<Record<string, string>>({});

  const handleStatusChange = async (app: JobApplication, status: string) => {
    await dispatch(updateApplicationStatus({ id: app.id, status }));
    dispatch(showToast({ message: 'Status updated', severity: 'success' }));
  };

  const handleFollowUpBlur = async (app: JobApplication) => {
    const val = followUpDraft[app.id];
    await dispatch(updateApplication({ id: app.id, data: { followUpDate: val || undefined } }));
    dispatch(showToast({ message: 'Follow-up updated', severity: 'success' }));
  };

  const handleNotesBlur = async (app: JobApplication) => {
    const val = notesDraft[app.id] ?? '';
    await dispatch(updateApplication({ id: app.id, data: { notes: val } }));
    dispatch(showToast({ message: 'Notes saved', severity: 'success' }));
  };

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.company && <TableCell>Company</TableCell>}
            {columns.title && <TableCell>Title</TableCell>}
            {columns.status && <TableCell>Status</TableCell>}
            {columns.applied && <TableCell>Applied</TableCell>}
            {columns.followUp && <TableCell>Follow-up</TableCell>}
            {columns.notes && <TableCell>Notes</TableCell>}
            {columns.resume && <TableCell>Resume</TableCell>}
            {columns.actions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow hover key={app.id}>
              {columns.company && <TableCell>{app.companyName}</TableCell>}
              {columns.title && <TableCell>{app.jobTitle}</TableCell>}
              {columns.status && (
                <TableCell>
                  <Select
                    size="small"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app, e.target.value as string)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
              )}
              {columns.applied && <TableCell>{formatDate(app.applicationDate)}</TableCell>}
              {columns.followUp && (
                <TableCell>
                  <TextField
                    type="date"
                    size="small"
                    value={followUpDraft[app.id] ?? (app.followUpDate ? app.followUpDate.substring(0,10) : '')}
                    onChange={(e) => setFollowUpDraft((p) => ({ ...p, [app.id]: e.target.value }))}
                    onBlur={() => handleFollowUpBlur(app)}
                    inputProps={{ 'aria-label': 'Follow-up date' }}
                  />
                </TableCell>
              )}
              {columns.notes && (
                <TableCell sx={{ minWidth: 220 }}>
                  <TextField
                    size="small"
                    placeholder="Add notes"
                    value={notesDraft[app.id] ?? (app.notes || '')}
                    onChange={(e) => setNotesDraft((p) => ({ ...p, [app.id]: e.target.value }))}
                    onBlur={() => handleNotesBlur(app)}
                    fullWidth
                  />
                </TableCell>
              )}
              {columns.resume && (
                <TableCell>{app.resume?.versionName || '-'}</TableCell>
              )}
              {columns.actions && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="View details">
                      <IconButton size="small" onClick={() => onView(app)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(app)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApplicationTable;


