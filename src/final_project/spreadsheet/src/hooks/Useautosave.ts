import { useEffect, useRef, useState } from 'react';
import type { CellData } from '../types';
import { documentService } from '../services/documentService';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export const useAutosave = (
  docId: string | null,
  cells: Record<string, CellData>,
  rowCount: number,
  colCount: number,
) => {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const saveNow = () => {
    if (!docId) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus('saving');
    try {
      documentService.saveDocument(docId, cells, { rowCount, colCount });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  // Debounced autosave on cells change
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!docId) return;
    setStatus('unsaved');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus('saving');
      try {
        documentService.saveDocument(docId, cells, { rowCount, colCount });
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [cells, docId, rowCount, colCount]);

  // Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNow(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // beforeunload
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (status === 'unsaved') e.preventDefault();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [status]);

  return { status, saveNow };
};