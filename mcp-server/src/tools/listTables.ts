import { getDatabase } from '../database.js';
import { logToolInvocation } from '../logger.js';

export async function listTables(): Promise<string[]> {
  const start = Date.now();
  const tool = 'list_tables';

  try {
    const db = getDatabase();
    const tables = await db.listTables();

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
