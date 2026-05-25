import { configureStore } from '@reduxjs/toolkit';
import spreadsheetReducer from './slices/spreadsheetSlice';
import documentsReducer from './slices/documentSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { autosaveMiddleware } from './autosaveMiddleware';

export const store = configureStore({
  reducer: {
    spreadsheet: spreadsheetReducer,
    documents: documentsReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autosaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
