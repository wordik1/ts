import { useState, useRef, useEffect } from 'react';
import type { CellData, CellCoords, SelectionRange, ContextMenuState } from '../../types';
import { evaluateFormula } from '../../utils/formula';
import { getCellId, defaultCell, defaultStyle, isInRange } from '../../utils/cellHelpers';
import { useAutosave } from '../../hooks/Useautosave';
import { GridCell } from './GridCell';
import { GridHeader } from './GridHeader';
import { ContextMenu } from './ContextMenu';
import { FormulaBar } from './FormulaBar';
import './SpreadsheetGrid.css';

const COL_W = 100;
const ROW_H = 24;
const ROW_HDR = 48;

interface Props {
  documentId?: string | null;
  initialCells?: Record<string, CellData>;
  initialRowCount?: number;
  initialColCount?: number;
  onCellsChange?: (cells: Record<string, CellData>) => void;
}

export const SpreadsheetGrid: React.FC<Props> = ({
  documentId = null,
  initialCells,
  initialRowCount = 100,
  initialColCount = 26,
  onCellsChange,
}) => {
  const [cells, setCells] = useState<Record<string, CellData>>(initialCells ?? {});
  const [rowCount, setRowCount] = useState(initialRowCount);
  const [colCount, setColCount] = useState(initialColCount);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<CellCoords | null>(null);
  const [range, setRange] = useState<SelectionRange | null>(null);
  const [editing, setEditing] = useState<CellCoords | null>(null);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<CellCoords | null>(null);
  const dragging = useRef(false);
  const resizingCol = useRef<{ col: number; x0: number; w0: number } | null>(null);
  const resizingRow = useRef<{ row: number; y0: number; h0: number } | null>(null);

  const { status, saveNow: _saveNow } = useAutosave(documentId, cells, rowCount, colCount);

  useEffect(() => {
    if (initialCells) {
      setCells(initialCells);
      onCellsChange?.(initialCells);
    }
  }, [initialCells]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingCol.current) {
        const { col, x0, w0 } = resizingCol.current;
        setColWidths(prev => ({ ...prev, [col]: Math.max(40, w0 + e.clientX - x0) }));
      }
      if (resizingRow.current) {
        const { row, y0, h0 } = resizingRow.current;
        setRowHeights(prev => ({ ...prev, [row]: Math.max(16, h0 + e.clientY - y0) }));
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizingCol.current = null;
      resizingRow.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const recompute = (c: Record<string, CellData>) => {
    const out = { ...c };
    for (const [id, cell] of Object.entries(out))
      if (cell.formula) out[id] = { ...cell, computedValue: evaluateFormula(cell.formula, id2 => out[id2]) };
    return out;
  };

  const setCell = (id: string, value: string) => {
    setCells(prev => {
      const next = recompute({
        ...prev,
        [id]: { ...prev[id] ?? defaultCell(), value, formula: value.startsWith('=') ? value : undefined, computedValue: undefined },
      });
      onCellsChange?.(next);
      return next;
    });
  };

  const stopEditing = () => { setEditing(null); containerRef.current?.focus(); };

  const onCellMouseDown = (col: number, row: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (editing) stopEditing();
    setSelected({ col, row });
    setRange({ start: { col, row }, end: { col, row } });
    dragStart.current = { col, row };
    dragging.current = true;
  };

  const onCellMouseEnter = (col: number, row: number) => {
    if (dragging.current && dragStart.current)
      setRange({ start: dragStart.current, end: { col, row } });
  };

  const onCellContextMenu = (col: number, row: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, col, row, type: 'cell' });
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editing) return;
    const { col, row } = editing;
    if (e.key === 'Enter') { e.preventDefault(); stopEditing(); setSelected({ col, row: Math.min(row + 1, rowCount - 1) }); }
    else if (e.key === 'Tab') { e.preventDefault(); stopEditing(); setSelected({ col: Math.min(col + 1, colCount - 1), row }); }
    else if (e.key === 'Escape') { e.preventDefault(); stopEditing(); }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (editing || !selected) return;
    const { col, row } = selected;
    const nav: Record<string, () => void> = {
      ArrowUp:    () => setSelected({ col, row: Math.max(0, row - 1) }),
      ArrowDown:  () => setSelected({ col, row: Math.min(rowCount - 1, row + 1) }),
      ArrowLeft:  () => setSelected({ col: Math.max(0, col - 1), row }),
      ArrowRight: () => setSelected({ col: Math.min(colCount - 1, col + 1), row }),
      Tab:        () => setSelected({ col: Math.min(colCount - 1, col + 1), row }),
      Enter:      () => setEditing(selected),
      F2:         () => setEditing(selected),
      Escape:     () => setRange({ start: selected, end: selected }),
    };
    if (e.key in nav) { e.preventDefault(); nav[e.key](); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const r = range ?? { start: selected, end: selected };
      setCells(prev => {
        const next = { ...prev };
        for (let row2 = Math.min(r.start.row, r.end.row); row2 <= Math.max(r.start.row, r.end.row); row2++)
          for (let col2 = Math.min(r.start.col, r.end.col); col2 <= Math.max(r.start.col, r.end.col); col2++) {
            const id = getCellId(col2, row2);
            next[id] = { ...defaultCell(), style: prev[id]?.style ?? defaultStyle() };
          }
        const recomputed = recompute(next);
        onCellsChange?.(recomputed);
        return recomputed;
      });
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setCell(getCellId(col, row), e.key);
      setEditing(selected);
    }
  };

  const insertRow = (at: number) => {
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const c = id.charCodeAt(0) - 65, r = parseInt(id.slice(1), 10) - 1;
        next[r >= at ? getCellId(c, r + 1) : id] = cell;
      }
      for (let c = 0; c < colCount; c++) next[getCellId(c, at)] = defaultCell();
      onCellsChange?.(next);
      return next;
    });
    setRowCount(n => n + 1);
  };

  const deleteRow = (at: number) => {
    if (rowCount <= 1) return;
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const c = id.charCodeAt(0) - 65, r = parseInt(id.slice(1), 10) - 1;
        if (r < at) next[id] = cell;
        else if (r > at) next[getCellId(c, r - 1)] = cell;
      }
      onCellsChange?.(next);
      return next;
    });
    setRowCount(n => n - 1);
  };

  const insertCol = (at: number) => {
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const c = id.charCodeAt(0) - 65, r = parseInt(id.slice(1), 10) - 1;
        next[c >= at ? getCellId(c + 1, r) : id] = cell;
      }
      for (let r = 0; r < rowCount; r++) next[getCellId(at, r)] = defaultCell();
      onCellsChange?.(next);
      return next;
    });
    setColCount(n => n + 1);
  };

  const deleteCol = (at: number) => {
    if (colCount <= 1) return;
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const c = id.charCodeAt(0) - 65, r = parseInt(id.slice(1), 10) - 1;
        if (c < at) next[id] = cell;
        else if (c > at) next[getCellId(c - 1, r)] = cell;
      }
      onCellsChange?.(next);
      return next;
    });
    setColCount(n => n - 1);
  };

  const activeCellId = selected ? getCellId(selected.col, selected.row) : '';

  return (
    <div ref={containerRef} className="spreadsheet-container" tabIndex={0} onKeyDown={onKeyDown}>
      <FormulaBar
        selectedCell={selected}
        selectionRange={range}
        cellData={cells[activeCellId]}
        onChange={setCell}
      />

      {documentId && (
        <div className={`save-status save-status--${status}`}>
          {status === 'saving' ? '💾 Сохранение...' : status === 'saved' ? '✅ Сохранено' : status === 'unsaved' ? '✏️ Не сохранено' : '❌ Ошибка'}
        </div>
      )}

      {(resizingCol.current || resizingRow.current) && (
        <div className={`resize-overlay ${resizingCol.current ? 'col' : 'row'}-resize`} />
      )}

      <div className="grid-wrapper">
        <GridHeader
          colCount={colCount}
          colWidths={colWidths}
          onResizeMouseDown={(col, e) => {
            e.preventDefault(); e.stopPropagation();
            resizingCol.current = { col, x0: e.clientX, w0: colWidths[col] ?? COL_W };
          }}
          onContextMenu={(e, col, row, type) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, col, row, type }); }}
        />

        <div className="grid-body">
          {Array.from({ length: rowCount }, (_, row) => {
            const rh = rowHeights[row] ?? ROW_H;
            return (
              <div key={row} className="grid-row" style={{ height: rh }}>
                <div
                  className="row-header"
                  style={{ width: ROW_HDR, minWidth: ROW_HDR, height: rh }}
                  onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, col: 0, row, type: 'row-header' }); }}
                >
                  {row + 1}
                  <div className="row-resize-handle" onMouseDown={e => { e.preventDefault(); e.stopPropagation(); resizingRow.current = { row, y0: e.clientY, h0: rh }; }} />
                </div>

                {Array.from({ length: colCount }, (_, col) => {
                  const id = getCellId(col, row);
                  const cell = cells[id] ?? defaultCell();
                  return (
                    <GridCell
                      key={col}
                      col={col} row={row}
                      cell={cell}
                      isSelected={selected?.col === col && selected?.row === row}
                      inRange={range ? isInRange(col, row, range) : false}
                      isEditing={editing?.col === col && editing?.row === row}
                      width={colWidths[col] ?? COL_W}
                      height={rh}
                      onMouseDown={onCellMouseDown}
                      onMouseEnter={onCellMouseEnter}
                      onDoubleClick={(c, r) => setEditing({ col: c, row: r })}
                      onContextMenu={onCellContextMenu}
                      onValueChange={val => setCell(id, val)}
                      onEditorKeyDown={onEditorKeyDown}
                      onBlur={stopEditing}
                      inputRef={{ current: null }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          onClose={() => setCtxMenu(null)}
          onInsertRowAbove={r => insertRow(r)}
          onInsertRowBelow={r => insertRow(r + 1)}
          onDeleteRow={deleteRow}
          onInsertColLeft={c => insertCol(c)}
          onInsertColRight={c => insertCol(c + 1)}
          onDeleteCol={deleteCol}
        />
      )}
    </div>
  );
};