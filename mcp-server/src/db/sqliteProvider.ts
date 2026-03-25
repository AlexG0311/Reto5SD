import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { IDatabase, ColumnInfo } from './IDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SQLiteProvider implements IDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.SQLITE_PATH ?? path.resolve(__dirname, '../../../Chinook_Sqlite.sqlite');
    // readonly:true bloquea escrituras a nivel de SQLite como capa extra de seguridad.
    // La validación de solo-SELECT se aplica también en validator.ts.
    this.db = new Database(dbPath, { readonly: true });

  }

  async query(sql: string): Promise<Record<string, unknown>[]> {
    return this.db.prepare(sql).all() as Record<string, unknown>[];
  }

  async listTables(): Promise<string[]> {
    const rows = this.db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
      .all() as { name: string }[];
    return rows.map((r) => r.name);
  }

  async getColumnInfo(tableName: string): Promise<ColumnInfo[]> {
    const rows = this.db
      .prepare(`PRAGMA table_info("${tableName}")`)
      .all() as { name: string; type: string; notnull: number; pk: number; dflt_value: unknown }[];
    return rows.map((r) => ({
      name: r.name,
      type: r.type,
      notnull: r.notnull === 1,
      pk: r.pk === 1,
      defaultValue: r.dflt_value,
    }));
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
