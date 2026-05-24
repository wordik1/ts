import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SpreadsheetDocument } from '../types';
import { documentService } from '../services/documentService';

interface DocumentsState {
  list: SpreadsheetDocument[];
  activeDocumentId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  list: [],
  activeDocumentId: null,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async () => {
    const docs = documentService.listDocuments();
    return docs;
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (params: { title: string; rows: number; cols: number }) => {
    const doc = documentService.createDocument(params.title, params.rows, params.cols);
    return doc;
  }
);

// thunk для удаления документа
export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: string) => {
    documentService.deleteDocument(id);
    return id;
  }
);

// thunk для переименования
export const renameDocument = createAsyncThunk(
  'documents/rename',
  async (params: { id: string; title: string }) => {
    documentService.renameDocument(params.id, params.title);
    return params;
  }
);

// thunk для дублирования
export const duplicateDocument = createAsyncThunk(
  'documents/duplicate',
  async (id: string) => {
    const doc = documentService.duplicateDocument(id);
    return doc;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocument(state, action: PayloadAction<string | null>) {
      state.activeDocumentId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchDocuments.rejected, (state) => {
        state.loading = false;
        state.error = 'Не удалось загрузить документы';
      })

      .addCase(createDocument.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.list = state.list.filter(d => d.id !== action.payload);
        if (state.activeDocumentId === action.payload) {
          state.activeDocumentId = null;
        }
      })

      .addCase(renameDocument.fulfilled, (state, action) => {
        const doc = state.list.find(d => d.id === action.payload.id);
        if (doc) {
          doc.title = action.payload.title;
          doc.updatedAt = new Date().toISOString();
        }
      })

      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export const { setActiveDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
