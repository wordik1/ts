import { SpreadsheetGrid } from "./components/SpreadsheetGrid";

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <SpreadsheetGrid />
      </main>
    </div>
  );
}

export default App;