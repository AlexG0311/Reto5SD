import { getDatabase } from '../database.js';
import { logToolInvocation } from '../logger.js';

export interface ColumnInfo {
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
  defaultValue: unknown;
}

export interface TableSchema {
  table: string;
  columns: ColumnInfo[];
}

export function getSchema(tableName?: string): TableSchema[] {
  const start = Date.now();
  const tool = 'get_schema';
  const input = { tableName };

  try {
    const db = getDatabase();

    // Obtener tablas según si se especificó una o todas
    let tables: string[];
    if (tableName) {
      tables = [tableName];
    } else {
      const rows = db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
        .all() as { name: string }[];
      tables = rows.map((r) => r.name);
    }

    const schemas: TableSchema[] = [];

    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info("${table}")`).all() as {
        name: string;
        type: string;
        notnull: number;
        pk: number;
        dflt_value: unknown;
      }[];

      schemas.push({
        table,
        columns: columns.map((c) => ({
          name: c.name,
          type: c.type,
          notnull: c.notnull === 1,
          pk: c.pk === 1,
          defaultValue: c.dflt_value,
        })),
      });
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
