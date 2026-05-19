import type { CellData } from '../types';

type GetCell = (id: string) => CellData | undefined;

const colToIndex = (s: string) => {
  let i = 0;
  for (const ch of s) i = i * 26 + ch.charCodeAt(0) - 64;
  return i - 1;
};

const indexToCol = (i: number) => {
  let col = '';
  while (i >= 0) { col = String.fromCharCode((i % 26) + 65) + col; i = Math.floor(i / 26) - 1; }
  return col;
};

const rangeIds = (range: string): string[] => {
  const [a, b] = range.split(':');
  if (!b) return [a.trim()];
  const c1 = colToIndex(a.replace(/\d/g, ''));
  const r1 = parseInt(a.replace(/\D/g, ''), 10) - 1;
  const c2 = colToIndex(b.replace(/\d/g, ''));
  const r2 = parseInt(b.replace(/\D/g, ''), 10) - 1;
  const ids: string[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++)
      ids.push(`${indexToCol(c)}${r + 1}`);
  return ids;
};

const nums = (args: string, get: GetCell) =>
  rangeIds(args)
    .map(id => Number(get(id)?.computedValue ?? get(id)?.value))
    .filter(n => !isNaN(n));

export const evaluateFormula = (formula: string, get: GetCell): string | number | boolean => {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.slice(1).trim().toUpperCase();

  const fn = expr.match(/^(SUM|AVERAGE)\((.+)\)$/);
  if (fn) {
    const vals = nums(fn[2], get);
    if (fn[1] === 'SUM')     return vals.reduce((a, b) => a + b, 0);
    if (fn[1] === 'AVERAGE') return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  const resolved = expr.replace(/([A-Z]+\d+)/g, id => {
    const val = get(id)?.computedValue ?? get(id)?.value;
    return isNaN(Number(val)) ? '0' : String(val ?? '0');
  });

  try {
    const result = new Function(`"use strict"; return (${resolved})`)();
    if (typeof result === 'number' && !isFinite(result)) return '#DIV/0!';
    return result;
  } catch {
    return '#ERROR!';
  }
};