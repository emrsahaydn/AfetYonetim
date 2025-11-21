import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './reducers/dashboardReducer';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
});

