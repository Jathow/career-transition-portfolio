import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import resumeReducer from './slices/resumeSlice';
import jobApplicationReducer from './slices/jobApplicationSlice';
import interviewReducer from './slices/interviewSlice';
import portfolioReducer from './slices/portfolioSlice';
import motivationReducer from './slices/motivationSlice';
import uiReducer, { showToast } from './slices/uiSlice';
import { isAnyOf } from '@reduxjs/toolkit';
import { createProject, deleteProject, updateProject } from './slices/projectSlice';
import { createApplication, deleteApplication, updateApplication, updateApplicationStatus, addApplicationNotes } from './slices/jobApplicationSlice';
import { createResume, deleteResume, updateResume } from './slices/resumeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    resumes: resumeReducer,
    jobApplications: jobApplicationReducer,
    interviews: interviewReducer,
    portfolio: portfolioReducer,
    motivation: motivationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat((storeApi) => (next) => (action) => {
      // Pass through first
      const result = next(action);
      // Success toasts for common CRUD operations
      if (isAnyOf(
        createProject.fulfilled,
        updateProject.fulfilled,
        deleteProject.fulfilled,
        createApplication.fulfilled,
        updateApplication.fulfilled,
        updateApplicationStatus.fulfilled,
        addApplicationNotes.fulfilled,
        deleteApplication.fulfilled,
        createResume.fulfilled,
        updateResume.fulfilled,
        deleteResume.fulfilled
      )(action)) {
        const messageMap: Record<string, string> = {
          [createProject.fulfilled.type]: 'Project created',
          [updateProject.fulfilled.type]: 'Project updated',
          [deleteProject.fulfilled.type]: 'Project deleted',
          [createApplication.fulfilled.type]: 'Application created',
          [updateApplication.fulfilled.type]: 'Application updated',
          [updateApplicationStatus.fulfilled.type]: 'Status updated',
          [addApplicationNotes.fulfilled.type]: 'Notes saved',
          [deleteApplication.fulfilled.type]: 'Application deleted',
          [createResume.fulfilled.type]: 'Resume created',
          [updateResume.fulfilled.type]: 'Resume updated',
          [deleteResume.fulfilled.type]: 'Resume deleted',
        };
        const message = messageMap[action.type] || 'Saved';
        storeApi.dispatch(showToast({ message, severity: 'success' }));
      }
      return result;
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;