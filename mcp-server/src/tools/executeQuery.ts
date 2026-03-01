import { getDatabase } from '../database.js';
import { validateSelectOnly } from '../validator.js';
import { logToolInvocation } from '../logger.js';

const MAX_ROWS = 500;

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
}

export function executeQuery(sql: string): QueryResult {
  const start = Date.now();
  const tool = 'execute_query';
  const input = { sql };

  // 1. Validar antes de cualquier interacción con la DB
  try {
    validateSelectOnly(sql);
  } catch (validationError: unknown) {
    const message = validationError instanceof Error ? validationError.message : String(validationError);
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      error: `VALIDATION_ERROR: ${message}`,
      durationMs: Date.now() - start,
    });
    throw validationError;
  }

  // 2. Ejecutar la query
  try {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    const allRows = stmt.all() as Record<string, unknown>[];

    const truncated = allRows.length > MAX_ROWS;
    const rows = truncated ? allRows.slice(0, MAX_ROWS) : allRows;
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      rowCount: rows.length,
      durationMs: Date.now() - start,
    });

    return {
      columns,
      rows,
      rowCount: rows.length,
      truncated,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      error: `EXECUTION_ERROR: ${message}`,
      durationMs: Date.now() - start,
    });
    throw error;
  }
}
