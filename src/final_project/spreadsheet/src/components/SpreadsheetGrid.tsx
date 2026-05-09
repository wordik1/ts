import { useState, useCallback, useRef, useEffect } from 'react';
import type { CellData, CellCoords, CellStyle } from '../types';
import './SpreadsheetGrid.css'

const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COL_COUNT = 26;

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

const getCellId = (col: number, row: number): string =>
  `${String.fromCharCode(65 + col)}${row + 1}`;

export const SpreadsheetGrid: React.FC = () => {
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [selectedCell, setSelectedCell] = useState<CellCoords | null>(null);
  const [editingCell, setEditingCell] = useState<CellCoords | null>(null);
  const [shiftStart, setShiftStart] = useState<CellCoords | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialCells: Record<string, CellData> = {};
    for (let r = 0; r < DEFAULT_ROW_COUNT; r++) {
      for (let c = 0; c < DEFAULT_COL_COUNT; c++) {
        const id = getCellId(c, r);
        if (!initialCells[id]) initialCells[id] = createDefaultCell();
      }
    }
    setCells(initialCells);
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = useCallback((col: number, row: number, e: React.MouseEvent) => {
    const coords = { col, row };
    setSelectedCell(coords);
    if (e.shiftKey && shiftStart) {
      // !!!доделать выделение диапазона
      setShiftStart(shiftStart);
    } else {
      setShiftStart(coords);
    }
  }, [shiftStart]);

  const handleCellDoubleClick = useCallback((col: number, row: number) => {
    setEditingCell({ col, row });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const { col, row } = selectedCell;

    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      setEditingCell(selectedCell);
    } else if (e.key === 'ArrowUp' && row > 0) {
      setSelectedCell({ col, row: row - 1 });
    } else if (e.key === 'ArrowDown' && row < DEFAULT_ROW_COUNT - 1) {
      setSelectedCell({ col, row: row + 1 });
    } else if (e.key === 'ArrowLeft' && col > 0) {
      setSelectedCell({ col: col - 1, row });
    } else if (e.key === 'ArrowRight' && col < DEFAULT_COL_COUNT - 1) {
      setSelectedCell({ col: col + 1, row });
    }
  }, [selectedCell]);

  const handleCellValueChange = useCallback((value: string) => {
    if (!editingCell) return;
    const id = getCellId(editingCell.col, editingCell.row);
    setCells(prev => ({
      ...prev,
      [id]: { ...prev[id], value, formula: value.startsWith('=') ? value : undefined },
    }));
  }, [editingCell]);

  const handleBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const activeCellId = selectedCell ? getCellId(selectedCell.col, selectedCell.row) : '';
  const activeCellData = cells[activeCellId];

  return (
    <div className="spreadsheet-container" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="formula-bar">
        <span className="cell-address">{activeCellId}</span>
        <input
          type="text"
          className="formula-input"
          value={activeCellData?.value ?? ''}
          onChange={e => handleCellValueChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBlur()}
          placeholder="Введите данные"
        />
      </div>

      <div className="grid-wrapper">
        <div className="grid-header">
          <div className="corner" />
          {Array.from({ length: DEFAULT_COL_COUNT }, (_, i) => (
            <div key={i} className="col-header">{String.fromCharCode(65 + i)}</div>
          ))}
        </div>
        <div className="grid-body">
          {Array.from({ length: DEFAULT_ROW_COUNT }, (_, row) => (
            <div key={row} className="grid-row">
              <div className="row-header">{row + 1}</div>
              {Array.from({ length: DEFAULT_COL_COUNT }, (_, col) => {
                const id = getCellId(col, row);
                const cell = cells[id];
                const isSelected = selectedCell?.col === col && selectedCell?.row === row;
                const isEditing = editingCell?.col === col && editingCell?.row === row;

                return (
                  <div
                    key={col}
                    className={`grid-cell ${isSelected ? 'selected' : ''}`}
                    style={{
                      backgroundColor: cell?.style.bg,
                      color: cell?.style.color,
                      fontWeight: cell?.style.bold ? 'bold' : 'normal',
                      fontStyle: cell?.style.italic ? 'italic' : 'normal',
                      textDecoration: cell?.style.underline ? 'underline' : 'none',
                      textAlign: cell?.style.align,
                    }}
                    onClick={e => handleCellClick(col, row, e)}
                    onDoubleClick={() => handleCellDoubleClick(col, row)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        className="cell-editor"
                        value={cell?.value ?? ''}
                        onChange={e => handleCellValueChange(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={e => e.key === 'Enter' && handleBlur()}
                      />
                    ) : (
                      <span className="cell-content">{cell?.computedValue ?? cell?.value ?? ''}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};