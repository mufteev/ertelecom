import { createSlice } from '@reduxjs/toolkit';

const historySlice = createSlice({
  name        : 'history',
  initialState: {
    requests: []
  },
  reducers    : {
    loadRequests: (state, { payload }) => {
      state.requests = payload;
    }
  }
});

export const { loadRequests } = historySlice.actions;
export default historySlice.reducer;
