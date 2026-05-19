import { useState } from 'react';

interface Props {
  onConfirm: (title: string, rows: number, cols: number) => void;
  onCancel: () => void;
}

export const CreateDocModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const [title, setTitle] = useState('Новый документ');
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(26);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Новый документ</h2>
        <div className="modal-form">
          <label className="modal-label">
            Название
            <input className="modal-input" value={title} autoFocus onChange={e => setTitle(e.target.value)} />
          </label>
          <div className="modal-row">
            <label className="modal-label">Строк<input className="modal-input" type="number" min={1} max={10000} value={rows} onChange={e => setRows(Number(e.target.value))} /></label>
            <label className="modal-label">Столбцов<input className="modal-input" type="number" min={1} max={26} value={cols} onChange={e => setCols(Number(e.target.value))} /></label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onCancel}>Отмена</button>
            <button className="btn btn-primary" onClick={() => { if (title.trim()) onConfirm(title.trim(), rows, cols); }}>Создать</button>
          </div>
        </div>
      </div>
    </div>
  );
};