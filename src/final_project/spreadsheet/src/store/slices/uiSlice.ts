import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { saveDocumentCells } from './spreadsheetSlice';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UiState {
  showCreateModal: boolean;
  saveStatus: SaveStatus;
}

const initialState: UiState = {
  showCreateModal: false,
  saveStatus: 'saved',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateModal(state) {
      state.showCreateModal = true;
    },
    closeCreateModal(state) {
      state.showCreateModal = false;
    },
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDocumentCells.pending, (state) => {
        state.saveStatus = 'saving';
      })
      .addCase(saveDocumentCells.fulfilled, (state) => {
        state.saveStatus = 'saved';
      })
      .addCase(saveDocumentCells.rejected, (state) => {
        state.saveStatus = 'error';
      });
  },
});

export const { openCreateModal, closeCreateModal, setSaveStatus } = uiSlice.actions;
export default uiSlice.reducer;
