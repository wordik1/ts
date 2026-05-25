import { useRef, useEffect } from 'react';
import type { CellCoords, ContextMenuState } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  setCellValue,
  clearRange,
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
} from '../../store/slices/spreadsheetSlice';
import { getCellId, defaultCell, isInRange } from '../../utils/cellHelpers';
import { GridCell } from './GridCell';
import { GridHeader } from './GridHeader';
import { ContextMenu } from './ContextMenu';
import { FormulaBar } from './FormulaBar';
import './SpreadsheetGrid.css';
import { useState } from 'react';

const COL_W = 100;
const ROW_H = 24;
const ROW_HDR = 48;

interface Props {
  documentId?: string | null;
}

export const SpreadsheetGrid: React.FC<Props> = ({ documentId = null }) => {
  const dispatch = useAppDispatch();

  const cells = useAppSelector(state => state.spreadsheet.cells);
  const rowCount = useAppSelector(state => state.spreadsheet.rowCount);
  const colCount = useAppSelector(state => state.spreadsheet.colCount);
  const colWidths = useAppSelector(state => state.spreadsheet.colWidths);
  const rowHeights = useAppSelector(state => state.spreadsheet.rowHeights);
  const selected = useAppSelector(state => state.spreadsheet.selected);
  const selectionRange = useAppSelector(state => state.spreadsheet.selectionRange);
  const editing = useAppSelector(state => state.spreadsheet.editing);
  const saveStatus = useAppSelector(state => state.ui.saveStatus);

  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<CellCoords | null>(null);
  const dragging = useRef(false);
  const resizingCol = useRef<{ col: number; x0: number; w0: number } | null>(null);
  const resizingRow = useRef<{ row: number; y0: number; h0: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingCol.current) {
        const { col, x0, w0 } = resizingCol.current;
        dispatch(setColWidth({ col, width: Math.max(40, w0 + e.clientX - x0) }));
      }
      if (resizingRow.current) {
        const { row, y0, h0 } = resizingRow.current;
        dispatch(setRowHeight({ row, height: Math.max(16, h0 + e.clientY - y0) }));
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizingCol.current = null;
      resizingRow.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dispatch]);

  const handleSetCell = (id: string, value: string) => {
    dispatch(setCellValue({ id, value }));
  };

  const handleStopEditing = () => {
    dispatch(stopEditing());
    containerRef.current?.focus();
  };

  const onCellMouseDown = (col: number, row: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (editing) handleStopEditing();
    dispatch(selectCell({ col, row }));
    dragStart.current = { col, row };
    dragging.current = true;
  };

  const onCellMouseEnter = (col: number, row: number) => {
    if (dragging.current && dragStart.current) {
      dispatch(updateSelectionEnd({ col, row }));
    }
  };

  const onCellContextMenu = (col: number, row: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, col, row, type: 'cell' });
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editing) return;
    const { col, row } = editing;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStopEditing();
      dispatch(selectCell({ col, row: Math.min(row + 1, rowCount - 1) }));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleStopEditing();
      dispatch(selectCell({ col: Math.min(col + 1, colCount - 1), row }));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleStopEditing();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (editing || !selected) return;
    const { col, row } = selected;

    const nav: Record<string, () => void> = {
      ArrowUp:    () => dispatch(selectCell({ col, row: Math.max(0, row - 1) })),
      ArrowDown:  () => dispatch(selectCell({ col, row: Math.min(rowCount - 1, row + 1) })),
      ArrowLeft:  () => dispatch(selectCell({ col: Math.max(0, col - 1), row })),
      ArrowRight: () => dispatch(selectCell({ col: Math.min(colCount - 1, col + 1), row })),
      Tab:        () => dispatch(selectCell({ col: Math.min(colCount - 1, col + 1), row })),
      Enter:      () => dispatch(startEditing({ col, row })),
      F2:         () => dispatch(startEditing({ col, row })),
      Escape:     () => dispatch(selectCell({ col, row })),
    };

    if (e.key in nav) {
      e.preventDefault();
      nav[e.key]();
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const r = selectionRange ?? { start: selected, end: selected };
      dispatch(clearRange(r));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey) {
      dispatch(setCellValue({ id: getCellId(col, row), value: e.key }));
      dispatch(startEditing({ col, row }));
    }
  };

  const activeCellId = selected ? getCellId(selected.col, selected.row) : '';

  return (
    <div ref={containerRef} className="spreadsheet-container" tabIndex={0} onKeyDown={onKeyDown}>
      <FormulaBar
        selectedCell={selected}
        selectionRange={selectionRange}
        cellData={cells[activeCellId]}
        onChange={handleSetCell}
      />

      {documentId && (
        <div className={`save-status save-status--${saveStatus}`}>
          {saveStatus === 'saving'  ? '💾 Сохранение...'
          : saveStatus === 'saved'  ? '✅ Сохранено'
          : saveStatus === 'unsaved'? '✏️ Не сохранено'
          :                           '❌ Ошибка'}
        </div>
      )}

      <div className="grid-wrapper">
        <GridHeader
          colCount={colCount}
          colWidths={colWidths}
          onResizeMouseDown={(col, e) => {
            e.preventDefault();
            e.stopPropagation();
            resizingCol.current = { col, x0: e.clientX, w0: colWidths[col] ?? COL_W };
          }}
          onContextMenu={(e, col, row, type) => {
            e.preventDefault();
            setCtxMenu({ x: e.clientX, y: e.clientY, col, row, type });
          }}
        />

        <div className="grid-body">
          {Array.from({ length: rowCount }, (_, row) => {
            const rh = rowHeights[row] ?? ROW_H;
            return (
              <div key={row} className="grid-row" style={{ height: rh }}>
                <div
                  className="row-header"
                  style={{ width: ROW_HDR, minWidth: ROW_HDR, height: rh }}
                  onContextMenu={e => {
                    e.preventDefault();
                    setCtxMenu({ x: e.clientX, y: e.clientY, col: 0, row, type: 'row-header' });
                  }}
                >
                  {row + 1}
                  <div
                    className="row-resize-handle"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      resizingRow.current = { row, y0: e.clientY, h0: rh };
                    }}
                  />
                </div>

                {Array.from({ length: colCount }, (_, col) => {
                  const id = getCellId(col, row);
                  const cell = cells[id] ?? defaultCell();
                  return (
                    <GridCell
                      key={col}
                      col={col}
                      row={row}
                      cell={cell}
                      isSelected={selected?.col === col && selected?.row === row}
                      inRange={selectionRange ? isInRange(col, row, selectionRange) : false}
                      isEditing={editing?.col === col && editing?.row === row}
                      width={colWidths[col] ?? COL_W}
                      height={rh}
                      onMouseDown={onCellMouseDown}
                      onMouseEnter={onCellMouseEnter}
                      onDoubleClick={(c, r) => dispatch(startEditing({ col: c, row: r }))}
                      onContextMenu={onCellContextMenu}
                      onValueChange={val => handleSetCell(id, val)}
                      onEditorKeyDown={onEditorKeyDown}
                      onBlur={handleStopEditing}
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
          onInsertRowAbove={r => dispatch(insertRow(r))}
          onInsertRowBelow={r => dispatch(insertRow(r + 1))}
          onDeleteRow={r => dispatch(deleteRow(r))}
          onInsertColLeft={c => dispatch(insertCol(c))}
          onInsertColRight={c => dispatch(insertCol(c + 1))}
          onDeleteCol={c => dispatch(deleteCol(c))}
        />
      )}
    </div>
  );
};