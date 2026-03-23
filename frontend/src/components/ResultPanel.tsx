import type { QueryResponse } from '../types';
import DataTable from './DataTable';
import ReactMarkdown from 'react-markdown';

interface ResultPanelProps {
  result: QueryResponse;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  return (
    <div className="result-panel">

      {/* Sección 1: Pregunta original */}
      <section className="result-section">
        <h3 className="section-title">
          <span className="section-icon">❓</span> Pregunta original
        </h3>
        <p className="question-text">{result.question}</p>
      </section>

      {/* Sección 2: SQL Generado */}
      <section className="result-section">
        <h3 className="section-title">
          <span className="section-icon">🔍</span> Consulta SQL generada
        </h3>
        {result.generatedSQL ? (
          <pre className="sql-code">{result.generatedSQL}</pre>
        ) : (
          <p className="no-results">No se generó una consulta SQL.</p>
        )}
      </section>

      {/* Sección 3: Resultado de la BD*/}
      <section className="result-section">
        <h3 className="section-title">
          <span className="section-icon">📊</span> Resultado de la base de datos
        </h3>
        <DataTable rows={result.rawResults} />
      </section>

      {/* Sección 4: Respuesta en lenguaje natural */}
      <section className="result-section">
        <h3 className="section-title">
          <span className="section-icon">💬</span> Respuesta
        </h3>
        <div className="natural-answer prose prose-sm max-w-none">
          <ReactMarkdown>{result.naturalLanguageAnswer}</ReactMarkdown>
        </div>
      </section>

    </div>
  );
}