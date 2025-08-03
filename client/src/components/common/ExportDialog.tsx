import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import exportService, { ExportOptions } from '../../services/exportService';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'projects',
    'applications',
    'interviews',
    'resumes',
  ]);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableModules = [
    { key: 'projects', label: 'Projects', description: 'Portfolio projects and progress' },
    { key: 'applications', label: 'Job Applications', description: 'Application tracking and status' },
    { key: 'interviews', label: 'Interviews', description: 'Interview scheduling and feedback' },
    { key: 'resumes', label: 'Resumes', description: 'Resume versions and templates' },
    { key: 'motivation', label: 'Motivation', description: 'Progress tracking and goals' },
    { key: 'revenue', label: 'Revenue & Market', description: 'Revenue tracking and market analysis' },
  ];

  const handleModuleToggle = (moduleKey: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedModules(availableModules.map(module => module.key));
  };

  const handleSelectNone = () => {
    setSelectedModules([]);
  };

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      setError('Please select at least one module to export');
      return;
    }

    if (useDateRange && (!startDate || !endDate)) {
      setError('Please select both start and end dates');
      return;
    }

    if (useDateRange && startDate && endDate && startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options: ExportOptions = {
        format,
        modules: selectedModules as any,
        ...(useDateRange && startDate && endDate && {
          dateRange: { start: startDate, end: endDate },
        }),
      };

      await exportService.exportData(options);
      onClose();
    } catch (err) {
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Export Data</Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <FormLabel component="legend">Export Format</FormLabel>
          <RadioGroup
            row
            value={format}
            onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
          >
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2">JSON</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Complete data structure, best for backups
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2">CSV</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Spreadsheet format, good for analysis
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Module Selection */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <FormLabel component="legend">Data to Export</FormLabel>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="small" onClick={handleSelectNone}>
                Select None
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            {availableModules.map((module) => (
              <Box
                key={module.key}
                sx={{
                  border: 1,
                  borderColor: selectedModules.includes(module.key) ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: selectedModules.includes(module.key) ? 'action.selected' : 'transparent',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedModules.includes(module.key)}
                      onChange={() => handleModuleToggle(module.key)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {module.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Date Range Selection */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" />
                <Typography>Filter by date range</Typography>
              </Box>
            }
          />
        </Box>

        {useDateRange && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
                maxDate={endDate || undefined}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={startDate || undefined}
              />
            </Box>
          </LocalizationProvider>
        )}

        {/* Summary */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Format: ${format.toUpperCase()}`} size="small" />
            <Chip label={`Modules: ${selectedModules.length}`} size="small" />
            {useDateRange && startDate && endDate && (
              <Chip 
                label={`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`} 
                size="small" 
              />
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          disabled={loading || selectedModules.length === 0}
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog; 