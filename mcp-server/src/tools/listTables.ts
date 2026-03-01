import { getDatabase } from '../database.js';
import { logToolInvocation } from '../logger.js';

export function listTables(): string[] {
  const start = Date.now();
  const tool = 'list_tables';

  try {
    const db = getDatabase();
    const rows = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
      .all() as { name: string }[];

    const tables = rows.map((r) => r.name);

    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input: {},
      rowCount: tables.length,
      durationMs: Date.now() - start,
    });

    return tables;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input: {},
      error: message,
      durationMs: Date.now() - start,
    });
    throw error;
  }
}
