import { memo } from 'react';
import type { CellData } from '../../types';

interface Props {
  col: number;
  row: number;
  cell: CellData;
  isSelected: boolean;
  inRange: boolean;
  isEditing: boolean;
  width: number;
  height: number;
  onMouseDown: (col: number, row: number, e: React.MouseEvent) => void;
  onMouseEnter: (col: number, row: number) => void;
  onDoubleClick: (col: number, row: number) => void;
  onContextMenu: (col: number, row: number, e: React.MouseEvent) => void;
  onValueChange: (value: string) => void;
  onEditorKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const formatValue = (cell: CellData) => {
  const v = cell.computedValue ?? cell.value;
  return String(v ?? '');
};

export const GridCell = memo(({ col, row, cell, isSelected, inRange, isEditing, width, height, onMouseDown, onMouseEnter, onDoubleClick, onContextMenu, onValueChange, onEditorKeyDown, onBlur, inputRef }: Props) => (
  <div
    className={`grid-cell${isSelected ? ' selected' : inRange ? ' in-range' : ''}`}
    style={{ width, minWidth: width, height, backgroundColor: cell.style.bg, color: cell.style.color, fontWeight: cell.style.bold ? 'bold' : 'normal', fontStyle: cell.style.italic ? 'italic' : 'normal', textDecoration: cell.style.underline ? 'underline' : 'none', textAlign: cell.style.align }}
    onMouseDown={e => onMouseDown(col, row, e)}
    onMouseEnter={() => onMouseEnter(col, row)}
    onDoubleClick={() => onDoubleClick(col, row)}
    onContextMenu={e => onContextMenu(col, row, e)}
  >
    {isEditing
      ? <input ref={inputRef} className="cell-editor" value={cell.value} onChange={e => onValueChange(e.target.value)} onBlur={onBlur} onKeyDown={onEditorKeyDown} autoFocus />
      : <span className="cell-content">{formatValue(cell)}</span>
    }
  </div>
));
GridCell.displayName = 'GridCell';