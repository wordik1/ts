import { useState, useRef } from 'react';
import type { SpreadsheetDocument } from '../../types';
import { documentService } from '../../services/documentService';
import { DocumentCard } from './DocumentCard';
import { CreateDocModal } from './CreatedocModal';
import './Dashboard.css';

interface Props { onOpenDocument: (id: string) => void; }

export const Dashboard: React.FC<Props> = ({ onOpenDocument }) => {
  const [docs, setDocs] = useState<SpreadsheetDocument[]>(() => documentService.listDocuments());
  const [showCreate, setShowCreate] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const reload = () => setDocs(documentService.listDocuments());

  const handleCreate = (title: string, rows: number, cols: number) => {
    documentService.createDocument(title, rows, cols);
    reload();
    setShowCreate(false);
  };

  const handleRename = (id: string, title: string) => {
    documentService.renameDocument(id, title);
    reload();
  };

  const handleDuplicate = (id: string) => {
    documentService.duplicateDocument(id);
    reload();
  };

  const handleDelete = (id: string) => {
    documentService.deleteDocument(id);
    reload();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const { cells, rows, cols } = documentService.importCSV(ev.target?.result as string);
      const doc = documentService.createDocument(file.name.replace(/\.csv$/i, ''), rows, cols);
      documentService.saveDocument(doc.id, cells, { rowCount: rows, colCount: cols });
      reload();
    };
    reader.readAsText(file, 'utf-8');
    if (importRef.current) importRef.current.value = '';
  };

  const sorted = [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Мои документы</h1>
        <div className="dashboard-toolbar">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Создать</button>
          <label className="btn btn-ghost">
            ⬆ Импорт CSV
            <input ref={importRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          </label>
        </div>
      </div>

      {sorted.length === 0
        ? <div className="dashboard-empty"><p>Нет документов</p><button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Создать</button></div>
        : <div className="doc-grid">{sorted.map(doc => <DocumentCard key={doc.id} doc={doc} onOpen={onOpenDocument} onRename={handleRename} onDuplicate={handleDuplicate} onDelete={handleDelete} />)}</div>
      }

      {showCreate && <CreateDocModal onConfirm={handleCreate} onCancel={() => setShowCreate(false)} />}
    </div>
  );
};