import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { flagsAPI } from '../../services/api';

export interface FlagsState {
  analytics: boolean;
  feedbackWidget: boolean;
  onboardingChecklist: boolean;
  interviewPrep: boolean;
  proEntitlements: boolean;
  loaded: boolean;
}

const initialState: FlagsState = {
  analytics: false,
  feedbackWidget: true,
  onboardingChecklist: true,
  interviewPrep: true,
  proEntitlements: false,
  loaded: false,
};

export const fetchFlags = createAsyncThunk('flags/fetch', async () => {
  const res = await flagsAPI.getFlags();
  return res.data.data as Partial<FlagsState>;
});

const flagsSlice = createSlice({
  name: 'flags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFlags.fulfilled, (state, action) => {
      Object.assign(state, action.payload);
      state.loaded = true;
    });
  },
});

export default flagsSlice.reducer;


