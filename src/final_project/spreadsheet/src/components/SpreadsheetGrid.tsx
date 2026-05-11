import { useState, useCallback, useRef, useEffect, useMemo, memo} from 'react';
import type { CellData, CellCoords, CellStyle, SelectionRange, ContextMenuState } from '../types';
import { evaluateFormula } from '../utils/formula';
import './SpreadsheetGrid.css';

const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COL_COUNT = 26;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const ROW_HEADER_WIDTH = 48;

const getCellId = (col: number, row: number): string =>
  `${String.fromCharCode(65 + col)}${row + 1}`;

const createDefaultCellStyle = (): CellStyle => ({
  bold: false,
  italic: false,
  underline: false,
  bg: '#ffffff',
  color: '#000000',
  align: 'left',
  format: 'default',
});

const createDefaultCell = (): CellData => ({
  value: '',
  style: createDefaultCellStyle(),
});

const isInRange = (col: number, row: number, range: SelectionRange): boolean => {
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
};

const getRangeLabel = (range: SelectionRange | null): string => {
  if (!range) return '';
  const { start, end } = range;
  const startId = getCellId(Math.min(start.col, end.col), Math.min(start.row, end.row));
  const endId = getCellId(Math.max(start.col, end.col), Math.max(start.row, end.row));
  return start.col === end.col && start.row === end.row ? startId : `${startId}:${endId}`;
};

interface GridCellProps {
  col: number;
  row: number;
  cell: CellData;
  isSelected: boolean;
  isInRangeFlag: boolean;
  isEditing: boolean;
  width: number;
  height: number;
  onMouseDown: (col: number, row: number, e: React.MouseEvent) => void;
  onMouseEnter: (col: number, row: number) => void;
  onDoubleClick: (col: number, row: number) => void;
  onValueChange: (value: string) => void;
  onEditorKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const GridCell = memo(({
  col, row, cell, isSelected, isInRangeFlag, isEditing,
  width, height,
  onMouseDown, onMouseEnter, onDoubleClick,
  onValueChange, onEditorKeyDown, onBlur, inputRef,
}: GridCellProps) => {
  const displayValue = useMemo(() => {
    const v = cell.computedValue ?? cell.value;
    if (cell.style.format === 'percent' && !isNaN(Number(v))) {
      return `${(Number(v) * 100).toFixed(2)}%`;
    }
    if (cell.style.format === 'currency' && !isNaN(Number(v))) {
      return Number(v).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    }
    return String(v ?? '');
  }, [cell.computedValue, cell.value, cell.style.format]);

  return (
    <div
      className={`grid-cell${isSelected ? ' selected' : ''}${isInRangeFlag && !isSelected ? ' in-range' : ''}`}
      style={{
        width,
        minWidth: width,
        height,
        backgroundColor: cell.style.bg,
        color: cell.style.color,
        fontWeight: cell.style.bold ? 'bold' : 'normal',
        fontStyle: cell.style.italic ? 'italic' : 'normal',
        textDecoration: cell.style.underline ? 'underline' : 'none',
        textAlign: cell.style.align,
      }}
      onMouseDown={e => onMouseDown(col, row, e)}
      onMouseEnter={() => onMouseEnter(col, row)}
      onDoubleClick={() => onDoubleClick(col, row)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="cell-editor"
          value={cell.value}
          onChange={e => onValueChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onEditorKeyDown}
        />
      ) : (
        <span className="cell-content">{displayValue}</span>
      )}
    </div>
  );
});
GridCell.displayName = 'GridCell';

interface ContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
  onInsertRowAbove: (row: number) => void;
  onInsertRowBelow: (row: number) => void;
  onDeleteRow: (row: number) => void;
  onInsertColLeft: (col: number) => void;
  onInsertColRight: (col: number) => void;
  onDeleteCol: (col: number) => void;
}

const ContextMenu = ({
  menu, onClose,
  onInsertRowAbove, onInsertRowBelow, onDeleteRow,
  onInsertColLeft, onInsertColRight, onDeleteCol,
}: ContextMenuProps) => {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ top: menu.y, left: menu.x }}
      onMouseDown={e => e.stopPropagation()}
    >
      {(menu.type === 'cell' || menu.type === 'row-header') && (
        <>
          <button className="context-menu-item" onClick={() => { onInsertRowAbove(menu.row); onClose(); }}>
            ➕ Вставить строку выше
          </button>
          <button className="context-menu-item" onClick={() => { onInsertRowBelow(menu.row); onClose(); }}>
            ➕ Вставить строку ниже
          </button>
          <button className="context-menu-item danger" onClick={() => { onDeleteRow(menu.row); onClose(); }}>
            🗑 Удалить строку
          </button>
        </>
      )}
      {menu.type === 'cell' && <hr className="context-menu-separator" />}
      {(menu.type === 'cell' || menu.type === 'col-header') && (
        <>
          <button className="context-menu-item" onClick={() => { onInsertColLeft(menu.col); onClose(); }}>
            ➕ Вставить столбец слева
          </button>
          <button className="context-menu-item" onClick={() => { onInsertColRight(menu.col); onClose(); }}>
            ➕ Вставить столбец справа
          </button>
          <button className="context-menu-item danger" onClick={() => { onDeleteCol(menu.col); onClose(); }}>
            🗑 Удалить столбец
          </button>
        </>
      )}
    </div>
  );
};

export const SpreadsheetGrid: React.FC = () => {
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [rowCount, setRowCount] = useState(DEFAULT_ROW_COUNT);
  const [colCount, setColCount] = useState(DEFAULT_COL_COUNT);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [selectedCell, setSelectedCell] = useState<CellCoords | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [editingCell, setEditingCell] = useState<CellCoords | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isMouseSelecting, setIsMouseSelecting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionStartRef = useRef<CellCoords | null>(null);

  const resizingCol = useRef<{ col: number; startX: number; startWidth: number } | null>(null);
  const resizingRow = useRef<{ row: number; startY: number; startHeight: number } | null>(null);
  const [resizeOverlay, setResizeOverlay] = useState<'col' | 'row' | null>(null);

  useEffect(() => {
    const init: Record<string, CellData> = {};
    for (let r = 0; r < DEFAULT_ROW_COUNT; r++) {
      for (let c = 0; c < DEFAULT_COL_COUNT; c++) {
        init[getCellId(c, r)] = createDefaultCell();
      }
    }
    setCells(init);
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const recomputeCells = useCallback((currentCells: Record<string, CellData>): Record<string, CellData> => {
    const getCell = (id: string) => currentCells[id];
    const updated = { ...currentCells };
    for (const [id, cell] of Object.entries(updated)) {
      if (cell.formula) {
        const computed = evaluateFormula(cell.formula, getCell);
        updated[id] = { ...cell, computedValue: computed };
      }
    }
    return updated;
  }, []);

  const handleCellValueChange = useCallback((value: string) => {
    if (!editingCell) return;
    const id = getCellId(editingCell.col, editingCell.row);
    setCells(prev => {
      const isFormula = value.startsWith('=');
      const newCells = {
        ...prev,
        [id]: {
          ...prev[id],
          value,
          formula: isFormula ? value : undefined,
          computedValue: isFormula ? prev[id]?.computedValue : undefined,
        },
      };
      return recomputeCells(newCells);
    });
  }, [editingCell, recomputeCells]);

  const stopEditing = useCallback(() => {
    setEditingCell(null);
    containerRef.current?.focus();
  }, []);

  const handleCellMouseDown = useCallback((col: number, row: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const coords = { col, row };
    if (editingCell) stopEditing();
    setSelectedCell(coords);
    setSelectionRange({ start: coords, end: coords });
    selectionStartRef.current = coords;
    setIsMouseSelecting(true);
  }, [editingCell, stopEditing]);

  const handleCellMouseEnter = useCallback((col: number, row: number) => {
    if (!isMouseSelecting || !selectionStartRef.current) return;
    setSelectionRange({ start: selectionStartRef.current, end: { col, row } });
  }, [isMouseSelecting]);

  useEffect(() => {
    const onMouseUp = () => setIsMouseSelecting(false);
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const handleCellDoubleClick = useCallback((col: number, row: number) => {
    setEditingCell({ col, row });
  }, []);

  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    col: number,
    row: number,
    type: ContextMenuState['type']
  ) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, col, row, type });
  }, []);

  const insertRow = useCallback((atRow: number) => {
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const col = id.charCodeAt(0) - 65;
        const row = parseInt(id.slice(1), 10) - 1;
        if (row >= atRow) {
          next[getCellId(col, row + 1)] = cell;
        } else {
          next[id] = cell;
        }
      }
      // fill the new row
      for (let c = 0; c < colCount; c++) {
        next[getCellId(c, atRow)] = createDefaultCell();
      }
      return next;
    });
    setRowCount(r => r + 1);
  }, [colCount]);

  const deleteRow = useCallback((atRow: number) => {
    if (rowCount <= 1) return;
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const col = id.charCodeAt(0) - 65;
        const row = parseInt(id.slice(1), 10) - 1;
        if (row < atRow) next[id] = cell;
        else if (row > atRow) next[getCellId(col, row - 1)] = cell;
      }
      return next;
    });
    setRowCount(r => r - 1);
  }, [rowCount]);

  const insertCol = useCallback((atCol: number) => {
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const col = id.charCodeAt(0) - 65;
        const row = parseInt(id.slice(1), 10) - 1;
        if (col >= atCol) {
          next[getCellId(col + 1, row)] = cell;
        } else {
          next[id] = cell;
        }
      }
      for (let r = 0; r < rowCount; r++) {
        next[getCellId(atCol, r)] = createDefaultCell();
      }
      return next;
    });
    setColCount(c => c + 1);
  }, [rowCount]);

  const deleteCol = useCallback((atCol: number) => {
    if (colCount <= 1) return;
    setCells(prev => {
      const next: Record<string, CellData> = {};
      for (const [id, cell] of Object.entries(prev)) {
        const col = id.charCodeAt(0) - 65;
        const row = parseInt(id.slice(1), 10) - 1;
        if (col < atCol) next[id] = cell;
        else if (col > atCol) next[getCellId(col - 1, row)] = cell;
      }
      return next;
    });
    setColCount(c => c - 1);
  }, [colCount]);

  const handleColResizeMouseDown = useCallback((col: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = colWidths[col] ?? DEFAULT_COL_WIDTH;
    resizingCol.current = { col, startX: e.clientX, startWidth };
    setResizeOverlay('col');
  }, [colWidths]);

  const handleRowResizeMouseDown = useCallback((row: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startHeight = rowHeights[row] ?? DEFAULT_ROW_HEIGHT;
    resizingRow.current = { row, startY: e.clientY, startHeight };
    setResizeOverlay('row');
  }, [rowHeights]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingCol.current) {
        const { col, startX, startWidth } = resizingCol.current;
        const newWidth = Math.max(40, startWidth + (e.clientX - startX));
        setColWidths(prev => ({ ...prev, [col]: newWidth }));
      }
      if (resizingRow.current) {
        const { row, startY, startHeight } = resizingRow.current;
        const newHeight = Math.max(16, startHeight + (e.clientY - startY));
        setRowHeights(prev => ({ ...prev, [row]: newHeight }));
      }
    };
    const onUp = () => {
      resizingCol.current = null;
      resizingRow.current = null;
      setResizeOverlay(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingCell) {
      // handled by editor input
      return;
    }
    if (!selectedCell) return;
    const { col, row } = selectedCell;

    switch (e.key) {
      case 'Enter':
      case 'F2':
        e.preventDefault();
        setEditingCell(selectedCell);
        break;
      case 'Delete':
      case 'Backspace': {
        e.preventDefault();

        const range = selectionRange ?? { start: selectedCell, end: selectedCell };
        setCells(prev => {
          const next = { ...prev };
          for (let r = Math.min(range.start.row, range.end.row); r <= Math.max(range.start.row, range.end.row); r++) {
            for (let c = Math.min(range.start.col, range.end.col); c <= Math.max(range.start.col, range.end.col); c++) {
              const id = getCellId(c, r);
              next[id] = { ...createDefaultCell(), style: prev[id]?.style ?? createDefaultCellStyle() };
            }
          }
          return recomputeCells(next);
        });
        break;
      }
      case 'Escape':
        e.preventDefault();
        setSelectionRange({ start: selectedCell, end: selectedCell });
        break;
      case 'Tab':
        e.preventDefault();
        if (col < colCount - 1) setSelectedCell({ col: col + 1, row });
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) setSelectedCell({ col, row: row - 1 });
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < rowCount - 1) setSelectedCell({ col, row: row + 1 });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) setSelectedCell({ col: col - 1, row });
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (col < colCount - 1) setSelectedCell({ col: col + 1, row });
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const id = getCellId(col, row);
          setCells(prev => ({ ...prev, [id]: { ...prev[id], value: e.key, formula: undefined, computedValue: undefined } }));
          setEditingCell(selectedCell);
        }
    }
  }, [editingCell, selectedCell, selectionRange, colCount, rowCount, recomputeCells]);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editingCell) return;
    const { col, row } = editingCell;
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing();
      const nextRow = row < rowCount - 1 ? row + 1 : row;
      setSelectedCell({ col, row: nextRow });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      stopEditing();
      const nextCol = col < colCount - 1 ? col + 1 : col;
      setSelectedCell({ col: nextCol, row });
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
    }
  }, [editingCell, stopEditing, rowCount, colCount]);

  const activeCellId = useMemo(() =>
    selectedCell ? getCellId(selectedCell.col, selectedCell.row) : '',
  [selectedCell]);

  const activeCellData = cells[activeCellId];
  const formulaBarValue = activeCellData?.formula ?? activeCellData?.value ?? '';
  const selectionLabel = getRangeLabel(selectionRange);

  return (
    <div
      ref={containerRef}
      className="spreadsheet-container"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Formula bar */}
      <div className="formula-bar">
        <span className="cell-address">{selectionLabel || activeCellId}</span>
        <input
          type="text"
          className="formula-input"
          value={formulaBarValue}
          onChange={e => {
            if (!selectedCell) return;
            const id = getCellId(selectedCell.col, selectedCell.row);
            const value = e.target.value;
            setCells(prev => {
              const isFormula = value.startsWith('=');
              const newCells = {
                ...prev,
                [id]: {
                  ...prev[id],
                  value,
                  formula: isFormula ? value : undefined,
                  computedValue: isFormula ? prev[id]?.computedValue : undefined,
                },
              };
              return recomputeCells(newCells);
            });
          }}
          onFocus={() => {
            if (selectedCell) setEditingCell(null);
          }}
          placeholder="Введите данные или формулу"
        />
      </div>

      {resizeOverlay && (
        <div className={`resize-overlay ${resizeOverlay}-resize`} />
      )}

      <div className="grid-wrapper">
        <div className="grid-header">
          <div className="corner" style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH }} />
          {Array.from({ length: colCount }, (_, c) => {
            const width = colWidths[c] ?? DEFAULT_COL_WIDTH;
            return (
              <div
                key={c}
                className="col-header-wrapper"
                style={{ width, minWidth: width }}
              >
                <div
                  className="col-header"
                  style={{ width, minWidth: width }}
                  onContextMenu={e => handleContextMenu(e, c, 0, 'col-header')}
                >
                  {String.fromCharCode(65 + c)}
                </div>
                <div
                  className="col-resize-handle"
                  onMouseDown={e => handleColResizeMouseDown(c, e)}
                />
              </div>
            );
          })}
        </div>

        <div className="grid-body">
          {Array.from({ length: rowCount }, (_, row) => {
            const rowHeight = rowHeights[row] ?? DEFAULT_ROW_HEIGHT;
            return (
              <div key={row} className="grid-row" style={{ height: rowHeight }}>
                <div
                  className="row-header"
                  style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: rowHeight }}
                  onContextMenu={e => handleContextMenu(e, 0, row, 'row-header')}
                >
                  {row + 1}
                  <div
                    className="row-resize-handle"
                    onMouseDown={e => handleRowResizeMouseDown(row, e)}
                  />
                </div>

                {Array.from({ length: colCount }, (_, col) => {
                  const id = getCellId(col, row);
                  const cell = cells[id] ?? createDefaultCell();
                  const isSelected = selectedCell?.col === col && selectedCell?.row === row;
                  const inRange = selectionRange ? isInRange(col, row, selectionRange) : false;
                  const isEditing = editingCell?.col === col && editingCell?.row === row;
                  const width = colWidths[col] ?? DEFAULT_COL_WIDTH;

                  return (
                    <GridCell
                      key={col}
                      col={col}
                      row={row}
                      cell={cell}
                      isSelected={isSelected}
                      isInRangeFlag={inRange}
                      isEditing={isEditing}
                      width={width}
                      height={rowHeight}
                      onMouseDown={handleCellMouseDown}
                      onMouseEnter={handleCellMouseEnter}
                      onDoubleClick={handleCellDoubleClick}
                      onValueChange={handleCellValueChange}
                      onEditorKeyDown={handleEditorKeyDown}
                      onBlur={stopEditing}
                      inputRef={isEditing ? inputRef : { current: null }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
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