export type CellFormat = 'default' | 'percent' | 'currency' | 'date';
export type CellAlign = 'left' | 'center' | 'right';

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bg: string;
  color: string;
  align: CellAlign;
  format: CellFormat;
}

export interface CellData {
  value: string;
  computedValue?: string | number | boolean;
  formula?: string;
  style: CellStyle;
}

export interface CellCoords {
  col: number;
  row: number;
}

export interface SelectionRange {
  start: CellCoords;
  end: CellCoords;
}

export interface ContextMenuState {
  x: number;
  y: number;
  col: number;
  row: number;
  type: 'cell' | 'col-header' | 'row-header';
}

export interface SpreadsheetDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  rowCount: number;
  colCount: number;
  preview: Record<string, CellData>;
}