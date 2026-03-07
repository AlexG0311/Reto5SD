import { getDatabase } from '../database.js';
import { logToolInvocation } from '../logger.js';
import { ColumnInfo } from '../db/IDatabase.js';

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

export async function getSchema(tableName?: string): Promise<TableSchema[]> {
  const start = Date.now();
  const tool = 'get_schema';
  const input = { tableName };

  try {
    const db = getDatabase();

    // Obtener tablas según si se especificó una o todas
    const tables = tableName ? [tableName] : await db.listTables();

    const schemas: TableSchema[] = [];
    for (const table of tables) {
      const columns = await db.getColumnInfo(table);
      schemas.push({ table, columns });
    }

    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      rowCount: schemas.length,
      durationMs: Date.now() - start,
    });

    return schemas;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      error: message,
      durationMs: Date.now() - start,
    });
    throw error;
  }
}
