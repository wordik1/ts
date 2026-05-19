import { useState, useRef } from 'react';
import type { CellData } from '../../types';
import { documentService } from '../../services/documentService';
import { SpreadsheetGrid } from '../SpreadsheetGrid/mainComp';
import './SpreadsheetPage.css';

interface Props { documentId: string; onBack: () => void; }

export const SpreadsheetPage: React.FC<Props> = ({ documentId, onBack }) => {
  const doc = documentService.listDocuments().find(d => d.id === documentId);
  const [title, setTitle] = useState(doc?.title ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const cellsRef = useRef<Record<string, CellData>>({});

  if (!doc) return (
    <div className="sp-error">
      <p>Документ не найден.</p>
      <button className="btn btn-ghost" onClick={onBack}>← Назад</button>
    </div>
  );

  const downloadFile = (name: string, content: string, mime: string) => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([content], { type: mime })), download: name });
    a.click();
  };

  const commitTitle = () => {
    setEditingTitle(false);
    if (title.trim()) documentService.renameDocument(documentId, title.trim());
  };

  const handleExportCSV = () => {
    const cells = cellsRef.current;
    downloadFile(`${title}.csv`, documentService.exportCSV(cells, doc.rowCount, doc.colCount), 'text/csv');
  };

  const handleExportJSON = () => {
    const cells = cellsRef.current;
    downloadFile(`${title}.json`, documentService.exportJSON(cells), 'application/json');
  };

  return (
    <div className="sp-page">
      <div className="sp-topbar">
        <button className="sp-back-btn" onClick={onBack}>← Назад</button>
        <div className="sp-title-wrapper">
          {editingTitle
            ? <input className="sp-title-input" value={title} autoFocus onChange={e => setTitle(e.target.value)} onBlur={commitTitle} onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') setEditingTitle(false); }} />
            : <h2 className="sp-title" onClick={() => setEditingTitle(true)}>{title}</h2>
          }
        </div>
        <div className="sp-toolbar">
          <button className="btn btn-ghost" onClick={handleExportCSV}>⬇ CSV</button>
          <button className="btn btn-ghost" onClick={handleExportJSON}>⬇ JSON</button>
        </div>
      </div>

      <div className="sp-grid-wrapper">
        <SpreadsheetGrid
          documentId={documentId}
          initialCells={documentService.loadCells(documentId)}
          initialRowCount={doc.rowCount}
          initialColCount={doc.colCount}
          onCellsChange={(cells) => { cellsRef.current = cells; }}
        />
      </div>
    </div>
  );
};