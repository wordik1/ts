import type { CellData } from '../types';

export const colToIndex = (colStr: string): number => {
  let index = 0;
  for (let i = 0; i < colStr.length; i++) {
    index = index * 26 + (colStr.charCodeAt(i) - 64);
  }
  return index - 1;
};

export const indexToCol = (index: number): string => {
  let col = '';
  while (index >= 0) {
    col = String.fromCharCode((index % 26) + 65) + col;
    index = Math.floor(index / 26) - 1;
  }
  return col;
};

export const parseRange = (range: string): string[] => {
  const [start, end] = range.split(':');
  const startCol = colToIndex(start.replace(/\d/g, ''));
  const startRow = parseInt(start.replace(/\D/g, ''), 10) - 1;
  const endCol = colToIndex(end.replace(/\d/g, ''));
  const endRow = parseInt(end.replace(/\D/g, ''), 10) - 1;

  const cells: string[] = [];
  for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
    for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
      cells.push(`${indexToCol(c)}${r + 1}`);
    }
  }
  return cells;
};

export const evaluateFormula = (formula: string, getCell: (id: string) => CellData | undefined): string | number | boolean => {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.slice(1).toUpperCase();

  const funcMatch = expr.match(/^(SUM|AVERAGE)\((.+)\)$/);
  if (funcMatch) {
    const [, funcName, args] = funcMatch;
    const cellIds = parseRange(args);
    const values = cellIds
      .map(id => getCell(id))
      .filter(Boolean)
      .map(c => Number(c!.computedValue ?? c!.value))
      .filter(n => !isNaN(n));

    if (funcName === 'SUM') return values.reduce((a, b) => a + b, 0);
    if (funcName === 'AVERAGE') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  let evaluated = expr.replace(/([A-Z]+\d+)/g, match => {
    const cell = getCell(match);
    if (!cell) return '0';
    const val = cell.computedValue ?? cell.value;
    return isNaN(Number(val)) ? '0' : String(val);
  });

  try {
    return new Function(`"use strict"; return (${evaluated})`)();
  } catch {
    return '#ERROR!';
  }
};