import type { CellData, SpreadsheetDocument } from '../types';

const DOCS_KEY = 'ss_docs';
const cellsKey = (id: string) => `ss_cells_${id}`;

const load = <T>(key: string): T | null => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
};
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

export const documentService = {
  listDocuments(): SpreadsheetDocument[] {
    return load<SpreadsheetDocument[]>(DOCS_KEY) ?? [];
  },

  loadCells(id: string): Record<string, CellData> {
    return load<Record<string, CellData>>(cellsKey(id)) ?? {};
  },

  createDocument(title: string, rows: number, cols: number): SpreadsheetDocument {
    const docs = this.listDocuments();
    const now = new Date().toISOString();
    const doc: SpreadsheetDocument = {
      id: crypto.randomUUID(), title,
      createdAt: now, updatedAt: now,
      rowCount: rows, colCount: cols, preview: {},
    };
    save(DOCS_KEY, [...docs, doc]);
    return doc;
  },

  saveDocument(id: string, cells: Record<string, CellData>, meta?: Partial<SpreadsheetDocument>) {
    save(cellsKey(id), cells);
    const docs = this.listDocuments();
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) return;
    const preview: Record<string, CellData> = {};
    ['A1','B1','C1','A2','B2','C2','A3','B3','C3'].forEach(k => { if (cells[k]) preview[k] = cells[k]; });
    docs[idx] = { ...docs[idx], ...meta, updatedAt: new Date().toISOString(), preview };
    save(DOCS_KEY, docs);
  },

  renameDocument(id: string, title: string) {
    const docs = this.listDocuments();
    const idx = docs.findIndex(d => d.id === id);
    if (idx !== -1) { docs[idx] = { ...docs[idx], title, updatedAt: new Date().toISOString() }; save(DOCS_KEY, docs); }
  },

  duplicateDocument(id: string): SpreadsheetDocument {
    const src = this.listDocuments().find(d => d.id === id);
    if (!src) throw new Error('Not found');
    const cells = this.loadCells(id);
    const now = new Date().toISOString();
    const doc: SpreadsheetDocument = { ...src, id: crypto.randomUUID(), title: `${src.title} (копия)`, createdAt: now, updatedAt: now };
    save(DOCS_KEY, [...this.listDocuments(), doc]);
    save(cellsKey(doc.id), cells);
    return doc;
  },

  deleteDocument(id: string) {
    save(DOCS_KEY, this.listDocuments().filter(d => d.id !== id));
    localStorage.removeItem(cellsKey(id));
  },

  exportCSV(cells: Record<string, CellData>, rows: number, cols: number): string {
    const lines: string[] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        const val = String(cells[`${String.fromCharCode(65 + c)}${r + 1}`]?.computedValue ?? cells[`${String.fromCharCode(65 + c)}${r + 1}`]?.value ?? '');
        row.push(val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val);
      }
      lines.push(row.join(','));
    }
    return lines.join('\n');
  },

  exportJSON(cells: Record<string, CellData>): string {
    const out: Record<string, unknown> = {};
    for (const [id, cell] of Object.entries(cells)) if (cell.value) out[id] = cell;
    return JSON.stringify(out, null, 2);
  },

  importCSV(csv: string): { cells: Record<string, CellData>; rows: number; cols: number } {
    const lines = csv.split('\n').filter(l => l.trim());
    const cells: Record<string, CellData> = {};
    let maxCols = 0;
    lines.forEach((line, ri) => {
      const fields: string[] = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
        else if (line[i] === ',' && !inQ) { fields.push(cur); cur = ''; }
        else cur += line[i];
      }
      fields.push(cur);
      maxCols = Math.max(maxCols, fields.length);
      fields.forEach((val, ci) => {
        cells[`${String.fromCharCode(65 + ci)}${ri + 1}`] = {
          value: val,
          style: { bold: false, italic: false, underline: false, bg: '#ffffff', color: '#000000', align: 'left', format: 'default' },
        };
      });
    });
    return { cells, rows: lines.length, cols: maxCols };
  },
};