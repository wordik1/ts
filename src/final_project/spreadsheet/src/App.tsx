import { SpreadsheetGrid } from "./components/SpreadsheetGrid";

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>📊 Spreadsheet App (Day 1)</h1>
      </header>
      <main style={{ flex: 1 }}>
        <SpreadsheetGrid />
      </main>
    </div>
  );
}

export default App;