interface DataTableProps {
  rows: Record<string, unknown>[];
}

export default function DataTable({ rows }: DataTableProps) {
  if (!rows.length) {
    return <p className="no-results">La consulta no retornó resultados.</p>;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col}>{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="row-count">{rows.length} fila{rows.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
