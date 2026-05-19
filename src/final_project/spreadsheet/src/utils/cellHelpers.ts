import type { CellData, CellStyle, SelectionRange } from '../types';

export const getCellId = (col: number, row: number) =>
  `${String.fromCharCode(65 + col)}${row + 1}`;

export const defaultStyle = (): CellStyle => ({
  bold: false, italic: false, underline: false,
  bg: '#ffffff', color: '#000000', align: 'left', format: 'default',
});

export const defaultCell = (): CellData => ({ value: '', style: defaultStyle() });

export const isInRange = (col: number, row: number, range: SelectionRange) => {
  const r1 = Math.min(range.start.row, range.end.row);
  const r2 = Math.max(range.start.row, range.end.row);
  const c1 = Math.min(range.start.col, range.end.col);
  const c2 = Math.max(range.start.col, range.end.col);
  return row >= r1 && row <= r2 && col >= c1 && col <= c2;
};

export const getRangeLabel = (range: SelectionRange | null) => {
  if (!range) return '';
  const a = getCellId(Math.min(range.start.col, range.end.col), Math.min(range.start.row, range.end.row));
  const b = getCellId(Math.max(range.start.col, range.end.col), Math.max(range.start.row, range.end.row));
  return a === b ? a : `${a}:${b}`;
};