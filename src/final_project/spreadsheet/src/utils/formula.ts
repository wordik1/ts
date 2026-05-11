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
  let i = index;
  while (i >= 0) {
    col = String.fromCharCode((i % 26) + 65) + col;
    i = Math.floor(i / 26) - 1;
  }
  return col;
};

export const parseRange = (range: string): string[] => {
  const [start, end] = range.split(':');
  if (!end) return [start.trim()];

  const startCol = colToIndex(start.replace(/\d/g, '').trim());
  const startRow = parseInt(start.replace(/\D/g, ''), 10) - 1;
  const endCol = colToIndex(end.replace(/\d/g, '').trim());
  const endRow = parseInt(end.replace(/\D/g, ''), 10) - 1;

  const cells: string[] = [];
  for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
    for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
      cells.push(`${indexToCol(c)}${r + 1}`);
    }
  }
  return cells;
};

const getNumericValues = (
  args: string,
  getCell: (id: string) => CellData | undefined
): number[] => {
  return parseRange(args)
    .map(id => getCell(id))
    .filter(Boolean)
    .map(c => Number(c!.computedValue ?? c!.value))
    .filter(n => !isNaN(n));
};

export const evaluateFormula = (
  formula: string,
  getCell: (id: string) => CellData | undefined
): string | number | boolean => {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.slice(1).trim().toUpperCase();

  // Multi-argument functions: MIN, MAX, COUNT, IF
  const funcMatch = expr.match(/^(SUM|AVERAGE|MIN|MAX|COUNT|COUNTA)\((.+)\)$/);
  if (funcMatch) {
    const [, funcName, args] = funcMatch;
    const values = getNumericValues(args, getCell);

    switch (funcName) {
      case 'SUM':
        return values.reduce((a, b) => a + b, 0);
      case 'AVERAGE':
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }
  }

  // IF(condition, valueIfTrue, valueIfFalse)
  const ifMatch = expr.match(/^IF\((.+),(.+),(.+)\)$/);
  if (ifMatch) {
    const [, condition, trueVal, falseVal] = ifMatch;
    try {
      const resolvedCondition = condition.replace(/([A-Z]+\d+)/g, match => {
        const cell = getCell(match);
        if (!cell) return '0';
        const val = cell.computedValue ?? cell.value;
        return isNaN(Number(val)) ? `"${val}"` : String(val);
      });
      const result = new Function(`"use strict"; return (${resolvedCondition})`)();
      return result ? trueVal.trim() : falseVal.trim();
    } catch {
      return '#ERROR!';
    }
  }

  // Substitute cell references in arithmetic expressions
  const resolved = expr.replace(/([A-Z]+\d+)/g, match => {
    const cell = getCell(match);
    if (!cell) return '0';
    const val = cell.computedValue ?? cell.value;
    return isNaN(Number(val)) ? '0' : String(val);
  });

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${resolved})`)();
    if (typeof result === 'number' && !isFinite(result)) return '#DIV/0!';
    return result;
  } catch {
    return '#ERROR!';
  }
};