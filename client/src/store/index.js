import { configureStore } from '@reduxjs/toolkit';

import calcSlice from './calc';
import historySlice from './history';

export default configureStore({
  reducer: {
    calc   : calcSlice,
    history: historySlice
  }
});
