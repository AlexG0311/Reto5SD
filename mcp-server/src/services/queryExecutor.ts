import { getDatabase } from '../database.js';

const MAX_ROWS = 500;

export interface QueryExecutionResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
}

export class QueryExecutor {
  async execute(sql: string): Promise<QueryExecutionResult> {
    const db = getDatabase();
    const allRows = await db.query(sql);

    const truncated = allRows.length > MAX_ROWS;
    const rows = truncated ? allRows.slice(0, MAX_ROWS) : allRows;
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
      rowCount: rows.length,
      truncated,
    };
  }
}
