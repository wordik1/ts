import type { ContextMenuState } from '../../types';

const COL_W = 100;

interface Props {
  colCount: number;
  colWidths: Record<number, number>;
  onResizeMouseDown: (col: number, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, col: number, row: number, type: ContextMenuState['type']) => void;
}

export const GridHeader: React.FC<Props> = ({ colCount, colWidths, onResizeMouseDown, onContextMenu }) => (
  <div className="grid-header">
    <div className="corner" />
    {Array.from({ length: colCount }, (_, c) => {
      const w = colWidths[c] ?? COL_W;
      return (
        <div key={c} className="col-header-wrapper" style={{ width: w, minWidth: w }}>
          <div className="col-header" style={{ width: w }} onContextMenu={e => onContextMenu(e, c, 0, 'col-header')}>
            {String.fromCharCode(65 + c)}
          </div>
          <div className="col-resize-handle" onMouseDown={e => onResizeMouseDown(c, e)} />
        </div>
      );
    })}
  </div>
);