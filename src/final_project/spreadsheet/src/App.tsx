import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Dashboard } from './components/Dashboard/Dashboard';
import { SpreadsheetPage } from './components/SpreadsheetPage/SpreadsheetPage';
import './components/Dashboard/Dashboard.css';
import './components/SpreadsheetPage/SpreadsheetPage.css';

type View = { page: 'dashboard' } | { page: 'document'; id: string };

function AppContent() {
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

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
