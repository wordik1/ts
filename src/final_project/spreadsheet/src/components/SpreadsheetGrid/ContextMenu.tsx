import { useEffect } from 'react';
import type { ContextMenuState } from '../../types';

interface Props {
  menu: ContextMenuState;
  onClose: () => void;
  onInsertRowAbove: (row: number) => void;
  onInsertRowBelow: (row: number) => void;
  onDeleteRow: (row: number) => void;
  onInsertColLeft: (col: number) => void;
  onInsertColRight: (col: number) => void;
  onDeleteCol: (col: number) => void;
}

export const ContextMenu: React.FC<Props> = ({ menu, onClose, onInsertRowAbove, onInsertRowBelow, onDeleteRow, onInsertColLeft, onInsertColRight, onDeleteCol }) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.context-menu')) onClose();
    };
    window.addEventListener('mousedown', handler, true);
    return () => window.removeEventListener('mousedown', handler, true);
  }, [onClose]);

  const btn = (label: string, onClick: () => void, danger = false) => (
    <button className={`context-menu-item${danger ? ' danger' : ''}`} onClick={() => { onClick(); onClose(); }}>
      {label}
    </button>
  );

  const showRow = menu.type === 'cell' || menu.type === 'row-header';
  const showCol = menu.type === 'cell' || menu.type === 'col-header';

  return (
    <div className="context-menu" style={{ top: menu.y, left: menu.x }}>
      {showRow && <>
        {btn('➕ Вставить строку выше', () => onInsertRowAbove(menu.row))}
        {btn('➕ Вставить строку ниже', () => onInsertRowBelow(menu.row))}
        {btn('🗑 Удалить строку', () => onDeleteRow(menu.row), true)}
      </>}
      {menu.type === 'cell' && <hr className="context-menu-separator" />}
      {showCol && <>
        {btn('➕ Вставить столбец слева', () => onInsertColLeft(menu.col))}
        {btn('➕ Вставить столбец справа', () => onInsertColRight(menu.col))}
        {btn('🗑 Удалить столбец', () => onDeleteCol(menu.col), true)}
      </>}
    </div>
  );
};