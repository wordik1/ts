import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CellData, CellCoords, SelectionRange } from '../types';
import { evaluateFormula } from '../utils/formula';
import { getCellId, defaultCell, defaultStyle } from '../utils/cellHelpers';
import { documentService } from '../services/documentService';

const MAX_HISTORY = 50;

interface SpreadsheetState {
  cells: Record<string, CellData>;
  rowCount: number;
  colCount: number;
  colWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  selected: CellCoords | null;
  selectionRange: SelectionRange | null;
  editing: CellCoords | null;
  history: Record<string, CellData>[];
  historyIndex: number;
  loadingCells: boolean;
}

const initialState: SpreadsheetState = {
  cells: {},
  rowCount: 100,
  colCount: 26,
  colWidths: {},
  rowHeights: {},
  selected: null,
  selectionRange: null,
  editing: null,
  history: [{}],
  historyIndex: 0,
  loadingCells: false,
};

function recompute(cells: Record<string, CellData>): Record<string, CellData> {
  const out = { ...cells };
  for (const [id, cell] of Object.entries(out)) {
    if (cell.formula) {
      out[id] = { ...cell, computedValue: evaluateFormula(cell.formula, id2 => out[id2]) };
    }
  }
  return out;
}

export const loadDocumentCells = createAsyncThunk(
  'spreadsheet/loadCells',
  async (params: { documentId: string; rowCount: number; colCount: number }) => {
    const cells = documentService.loadCells(params.documentId);
    return {
      cells,
      rowCount: params.rowCount,
      colCount: params.colCount,
    };
  }
);

export const saveDocumentCells = createAsyncThunk(
  'spreadsheet/saveCells',
  async (params: { documentId: string; cells: Record<string, CellData>; rowCount: number; colCount: number }) => {
    documentService.saveDocument(params.documentId, params.cells, {
      rowCount: params.rowCount,
      colCount: params.colCount,
    });
  }
);

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setCellValue(state, action: PayloadAction<{ id: string; value: string }>) {
      const { id, value } = action.payload;
      const prev = state.cells[id] ?? defaultCell();
      state.cells[id] = {
        ...prev,
        value,
        formula: value.startsWith('=') ? value : undefined,
        computedValue: undefined,
      };
      state.cells = recompute(state.cells);

      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ ...state.cells });
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex += 1;
      }
    },

    clearRange(state, action: PayloadAction<SelectionRange>) {
      const r = action.payload;
      for (let row = Math.min(r.start.row, r.end.row); row <= Math.max(r.start.row, r.end.row); row++) {
        for (let col = Math.min(r.start.col, r.end.col); col <= Math.max(r.start.col, r.end.col); col++) {
          const id = getCellId(col, row);
          state.cells[id] = { ...defaultCell(), style: state.cells[id]?.style ?? defaultStyle() };
        }
      }
      state.cells = recompute(state.cells);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ ...state.cells });
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex += 1;
      }
    },

    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.cells = { ...state.history[state.historyIndex] };
      }
    },

    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.cells = { ...state.history[state.historyIndex] };
      }
    },

    selectCell(state, action: PayloadAction<CellCoords>) {
      state.selected = action.payload;
      state.selectionRange = { start: action.payload, end: action.payload };
    },

    updateSelectionEnd(state, action: PayloadAction<CellCoords>) {
      if (state.selectionRange) {
        state.selectionRange = { start: state.selectionRange.start, end: action.payload };
      }
    },

    startEditing(state, action: PayloadAction<CellCoords>) {
      state.editing = action.payload;
    },

    stopEditing(state) {
      state.editing = null;
    },

    setColWidth(state, action: PayloadAction<{ col: number; width: number }>) {
      state.colWidths[action.payload.col] = action.payload.width;
    },

    setRowHeight(state, action: PayloadAction<{ row: number; height: number }>) {
      state.rowHeights[action.payload.row] = action.payload.height;
    },

    insertRow(state, action: PayloadAction<number>) {
      const at = action.payload;
      const newCells: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(state.cells)) {
        const c = id.charCodeAt(0) - 65;
        const r = parseInt(id.slice(1), 10) - 1;
        newCells[r >= at ? getCellId(c, r + 1) : id] = cell;
      }
      for (let c = 0; c < state.colCount; c++) {
        newCells[getCellId(c, at)] = defaultCell();
      }
      state.cells = newCells;
      state.rowCount += 1;
    },

    deleteRow(state, action: PayloadAction<number>) {
      if (state.rowCount <= 1) return;
      const at = action.payload;
      const newCells: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(state.cells)) {
        const c = id.charCodeAt(0) - 65;
        const r = parseInt(id.slice(1), 10) - 1;
        if (r < at) newCells[id] = cell;
        else if (r > at) newCells[getCellId(c, r - 1)] = cell;
      }
      state.cells = newCells;
      state.rowCount -= 1;
    },

    insertCol(state, action: PayloadAction<number>) {
      const at = action.payload;
      const newCells: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(state.cells)) {
        const c = id.charCodeAt(0) - 65;
        const r = parseInt(id.slice(1), 10) - 1;
        newCells[c >= at ? getCellId(c + 1, r) : id] = cell;
      }
      for (let r = 0; r < state.rowCount; r++) {
        newCells[getCellId(at, r)] = defaultCell();
      }
      state.cells = newCells;
      state.colCount += 1;
    },

    deleteCol(state, action: PayloadAction<number>) {
      if (state.colCount <= 1) return;
      const at = action.payload;
      const newCells: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(state.cells)) {
        const c = id.charCodeAt(0) - 65;
        const r = parseInt(id.slice(1), 10) - 1;
        if (c < at) newCells[id] = cell;
        else if (c > at) newCells[getCellId(c - 1, r)] = cell;
      }
      state.cells = newCells;
      state.colCount -= 1;
    },

    resetSpreadsheet(state) {
      state.cells = {};
      state.history = [{}];
      state.historyIndex = 0;
      state.selected = null;
      state.selectionRange = null;
      state.editing = null;
      state.colWidths = {};
      state.rowHeights = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocumentCells.pending, (state) => {
        state.loadingCells = true;
      })
      .addCase(loadDocumentCells.fulfilled, (state, action) => {
        const computed = recompute(action.payload.cells);
        state.cells = computed;
        state.rowCount = action.payload.rowCount;
        state.colCount = action.payload.colCount;

        state.history = [computed];
        state.historyIndex = 0;
        state.loadingCells = false;
      })
      .addCase(loadDocumentCells.rejected, (state) => {
        state.loadingCells = false;
      });
  },
});

export const {
  setCellValue,
  clearRange,
  undo,
  redo,
  selectCell,
  updateSelectionEnd,
  startEditing,
  stopEditing,
  setColWidth,
  setRowHeight,
  insertRow,
  deleteRow,
  insertCol,
  deleteCol,
  resetSpreadsheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;
