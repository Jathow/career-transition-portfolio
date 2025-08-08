import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { RootState } from '../../store/store';
import { hideToast } from '../../store/slices/uiSlice';

const ToastProvider: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.ui.toasts);

  return (
    <>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.durationMs ?? 3000}
          onClose={() => dispatch(hideToast(toast.id))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
       >
          <Alert severity={toast.severity} onClose={() => dispatch(hideToast(toast.id))} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastProvider;


