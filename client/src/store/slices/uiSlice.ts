import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  durationMs?: number;
}

interface UiState {
  toasts: ToastMessage[];
}

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'> & { id?: string }>) => {
      const id = action.payload.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      state.toasts.push({ id, message: action.payload.message, severity: action.payload.severity, durationMs: action.payload.durationMs });
    },
    hideToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    }
  }
});

export const { showToast, hideToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;


