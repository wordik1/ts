import { useEffect, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
  renameDocument,
  duplicateDocument,
} from '../../store/slices/documentSlice';
import { openCreateModal, closeCreateModal } from '../../store/slices/uiSlice';
import { documentService } from '../../services/documentService';
import { DocumentCard } from './DocumentCard';
import { CreateDocModal } from './CreatedocModal';
import './Dashboard.css';

interface Props {
  onOpenDocument: (id: string) => void;
}

export const Dashboard: React.FC<Props> = ({ onOpenDocument }) => {
  const dispatch = useAppDispatch();

  const docs = useAppSelector(state => state.documents.list);
  const loading = useAppSelector(state => state.documents.loading);
  const showCreate = useAppSelector(state => state.ui.showCreateModal);

  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const sorted = useMemo(() => {
    return [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [docs]);

  const handleCreate = (title: string, rows: number, cols: number) => {
    dispatch(createDocument({ title, rows, cols }));
    dispatch(closeCreateModal());
  };

  const handleRename = (id: string, title: string) => {
    dispatch(renameDocument({ id, title }));
  };

  const handleDuplicate = (id: string) => {
    dispatch(duplicateDocument(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteDocument(id));
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const { cells, rows, cols } = documentService.importCSV(ev.target?.result as string);
      const doc = documentService.createDocument(file.name.replace(/\.csv$/i, ''), rows, cols);
      documentService.saveDocument(doc.id, cells, { rowCount: rows, colCount: cols });
      dispatch(fetchDocuments());
    };
    reader.readAsText(file, 'utf-8');
    if (importRef.current) importRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Мои документы</h1>
        <div className="dashboard-toolbar">
          <button className="btn btn-primary" onClick={() => dispatch(openCreateModal())}>
            + Создать
          </button>
          <label className="btn btn-ghost">
            ⬆ Импорт CSV
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportCSV}
            />
          </label>
        </div>
      </div>

      {sorted.length === 0
        ? (
          <div className="dashboard-empty">
            <p>Нет документов</p>
            <button className="btn btn-primary" onClick={() => dispatch(openCreateModal())}>
              + Создать
            </button>
          </div>
        ) : (
          <div className="doc-grid">
            {sorted.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpen={onOpenDocument}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      }

      {showCreate && (
        <CreateDocModal
          onConfirm={handleCreate}
          onCancel={() => dispatch(closeCreateModal())}
        />
      )}
    </div>
  );
};
