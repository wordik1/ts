import { useState } from 'react';
import type { SpreadsheetDocument } from '../../types';

interface Props {
  doc: SpreadsheetDocument;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DocumentCard: React.FC<Props> = ({ doc, onOpen, onRename, onDuplicate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const commitRename = () => {
    setEditing(false);
    if (title.trim() && title.trim() !== doc.title) onRename(doc.id, title.trim());
    else setTitle(doc.title);
  };

  return (
    <div className="doc-card">
      <div className="doc-card-preview" onClick={() => onOpen(doc.id)}>
        <div className="doc-preview-grid">
          {['A1','B1','C1','A2','B2','C2','A3','B3','C3'].map(id => (
            <div key={id} className="doc-preview-cell">
              {String(doc.preview[id]?.computedValue ?? doc.preview[id]?.value ?? '')}
            </div>
          ))}
        </div>
      </div>

      <div className="doc-card-body">
        {editing
          ? <input className="doc-card-title-input" value={title} autoFocus onChange={e => setTitle(e.target.value)} onBlur={commitRename} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setTitle(doc.title); setEditing(false); } }} />
          : <h3 className="doc-card-title" onClick={() => onOpen(doc.id)}>{doc.title}</h3>
        }
        <p className="doc-card-meta">Изменён: {new Date(doc.updatedAt).toLocaleString('ru-RU')}</p>
        <p className="doc-card-meta">{doc.rowCount} × {doc.colCount}</p>
      </div>

      <div className="doc-card-actions">
        <button className="doc-action-btn" onClick={() => onOpen(doc.id)}>📂</button>
        <button className="doc-action-btn" onClick={() => setEditing(true)}>✏️</button>
        <button className="doc-action-btn" onClick={() => onDuplicate(doc.id)}>📋</button>
        <button className="doc-action-btn danger" onClick={() => setConfirmDelete(true)}>🗑️</button>
      </div>

      {confirmDelete && (
        <div className="doc-card-confirm">
          <p>Удалить «{doc.title}»?</p>
          <div className="doc-card-confirm-actions">
            <button className="btn btn-danger" onClick={() => onDelete(doc.id)}>Удалить</button>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};