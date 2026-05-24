import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { saveDocumentCells } from '../slices/spreadsheetSlice';
import { setSaveStatus } from '../slices/uiSlice';

let timer: ReturnType<typeof setTimeout> | null = null;

export const autosaveMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  const actionType = (action as { type: string }).type;
  const cellChangeActions = [
    'spreadsheet/setCellValue',
    'spreadsheet/clearRange',
    'spreadsheet/insertRow',
    'spreadsheet/deleteRow',
    'spreadsheet/insertCol',
    'spreadsheet/deleteCol',
    'spreadsheet/undo',
    'spreadsheet/redo',
  ];

  if (cellChangeActions.includes(actionType)) {
    const state = store.getState() as RootState;
    const documentId = state.documents.activeDocumentId;

    if (!documentId) return result;

    store.dispatch(setSaveStatus('unsaved'));

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      const freshState = store.getState() as RootState;
      store.dispatch(
        saveDocumentCells({
          documentId,
          cells: freshState.spreadsheet.cells,
          rowCount: freshState.spreadsheet.rowCount,
          colCount: freshState.spreadsheet.colCount,
        })
      );
    }, 500);
  }

  return result;
};
