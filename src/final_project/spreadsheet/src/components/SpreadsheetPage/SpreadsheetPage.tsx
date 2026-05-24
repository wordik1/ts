import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loadDocumentCells, saveDocumentCells, resetSpreadsheet } from '../../slices/spreadsheetSlice';
import { renameDocument, setActiveDocument } from '../../slices/documentSlice';
import { documentService } from '../../services/documentService';
import { SpreadsheetGrid } from '../SpreadsheetGrid/mainComp';
import './SpreadsheetPage.css';

interface Props {
  documentId: string;
  onBack: () => void;
}

export const SpreadsheetPage: React.FC<Props> = ({ documentId, onBack }) => {
  const dispatch = useAppDispatch();

  const docs = useAppSelector(state => state.documents.list);
  const cells = useAppSelector(state => state.spreadsheet.cells);
  const rowCount = useAppSelector(state => state.spreadsheet.rowCount);
  const colCount = useAppSelector(state => state.spreadsheet.colCount);
  const loadingCells = useAppSelector(state => state.spreadsheet.loadingCells);

  const doc = docs.find(d => d.id === documentId);

  const [title, setTitle] = useState(doc?.title ?? '');
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    if (!doc) return;
    dispatch(setActiveDocument(documentId));
    dispatch(loadDocumentCells({
      documentId,
      rowCount: doc.rowCount,
      colCount: doc.colCount,
    }));

    return () => {
      dispatch(setActiveDocument(null));
      dispatch(resetSpreadsheet());
    };
  }, [documentId]);

  if (!doc) {
    return (
      <div className="sp-error">
        <p>Документ не найден.</p>
        <button className="btn btn-ghost" onClick={onBack}>← Назад</button>
      </div>
    );
  }

  if (loadingCells) {
    return (
      <div className="sp-loading">
        <p>Загрузка документа...</p>
      </div>
    );
  }

  const downloadFile = (name: string, content: string, mime: string) => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: mime })),
      download: name,
    });
    a.click();
  };

  const commitTitle = () => {
    setEditingTitle(false);
    if (title.trim()) {
      dispatch(renameDocument({ id: documentId, title: title.trim() }));
    }
  };

  const handleExportCSV = () => {
    downloadFile(
      `${title}.csv`,
      documentService.exportCSV(cells, rowCount, colCount),
      'text/csv'
    );
  };

  const handleExportJSON = () => {
    downloadFile(
      `${title}.json`,
      documentService.exportJSON(cells),
      'application/json'
    );
  };

  const handleSaveNow = () => {
    dispatch(saveDocumentCells({ documentId, cells, rowCount, colCount }));
  };

  return (
    <div className="sp-page">
      <div className="sp-topbar">
        <button className="sp-back-btn" onClick={onBack}>← Назад</button>

        <div className="sp-title-wrapper">
          {editingTitle
            ? (
              <input
                className="sp-title-input"
                value={title}
                autoFocus
                onChange={e => setTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
              />
            ) : (
              <h2 className="sp-title" onClick={() => setEditingTitle(true)}>{title}</h2>
            )
          }
        </div>

        <div className="sp-toolbar">
          <button className="btn btn-ghost" onClick={handleSaveNow}>💾 Ctrl+S</button>
          <button className="btn btn-ghost" onClick={handleExportCSV}>⬇ CSV</button>
          <button className="btn btn-ghost" onClick={handleExportJSON}>⬇ JSON</button>
        </div>
      </div>

      <div className="sp-grid-wrapper">
        <SpreadsheetGrid documentId={documentId} />
      </div>
    </div>
  );
};
