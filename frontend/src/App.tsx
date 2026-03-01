import { useState } from 'react';
import './App.css';
import QueryForm from './components/QueryForm';
import ResultPanel from './components/ResultPanel';
import type { QueryResponse } from './types';

const API_URL = 'http://localhost:3001/api/query';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json() as QueryResponse | { error: string };

      if (!res.ok || 'error' in data) {
        setError('error' in data ? data.error : 'Error desconocido');
        return;
      }

      setResult(data as QueryResponse);
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Chinook DB — Consultas en Lenguaje Natural</h1>
        <p className="app-subtitle">Impulsado por IA + Model Context Protocol (MCP)</p>
      </header>

      <main className="app-main">
        <QueryForm onSubmit={handleQuery} isLoading={isLoading} />

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Procesando consulta con IA...</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && <ResultPanel result={result} />}
      </main>
    </div>
  );
}

export default App;
