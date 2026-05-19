import { useState } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { SpreadsheetPage } from './components/SpreadsheetPage/SpreadsheetPage';
import './components/Dashboard/Dashboard.css';
import './components/SpreadsheetPage/SpreadsheetPage.css';

type View = { page: 'dashboard' } | { page: 'document'; id: string };

function App() {
  const [view, setView] = useState<View>({ page: 'dashboard' });

  return (
    <>
      {view.page === 'dashboard' && (
        <Dashboard onOpenDocument={id => setView({ page: 'document', id })} />
      )}
      {view.page === 'document' && (
        <SpreadsheetPage
          documentId={view.id}
          onBack={() => setView({ page: 'dashboard' })}
        />
      )}
    </>
  );
}

export default App;