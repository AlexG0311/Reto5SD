import mysql from 'mysql2/promise';
import type { Connection, RowDataPacket } from 'mysql2/promise';
import { IDatabase, ColumnInfo } from './IDatabase.js';

export class MySQLProvider implements IDatabase {
  private connection: Connection | null = null;

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'chinook',
      });
    }
    return this.connection;
  }

  async query(sql: string, params?: (string | number | boolean | null)[]): Promise<Record<string, unknown>[]> {
    const conn = await this.getConnection();
    const [rows] = await conn.execute<RowDataPacket[]>(sql, params);
    return rows as Record<string, unknown>[];
  }

  async listTables(): Promise<string[]> {
    const conn = await this.getConnection();
    const [rows] = await conn.execute<RowDataPacket[]>('SHOW TABLES');
    return rows.map((r) => Object.values(r)[0] as string);
  }

  async getColumnInfo(tableName: string): Promise<ColumnInfo[]> {
    const conn = await this.getConnection();
    const dbName = process.env.DB_NAME ?? 'chinook';
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [dbName, tableName]
    );
    return rows.map((r) => ({
      name: r.COLUMN_NAME as string,
      type: r.DATA_TYPE as string,
      notnull: r.IS_NULLABLE === 'NO',
      pk: r.COLUMN_KEY === 'PRI',
      defaultValue: r.COLUMN_DEFAULT,
    }));
  }

  async close(): Promise<void> {
    await this.connection?.end();
    this.connection = null;
  }
}
