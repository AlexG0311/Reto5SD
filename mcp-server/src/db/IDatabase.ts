/**
 * Contrato que debe implementar cualquier proveedor de base de datos.
 * Para agregar un nuevo proveedor: implementa esta interfaz y
 * regístralo en dbProviderFactory.ts.
 */
export interface IDatabase {
  /** Ejecuta una consulta SQL y devuelve las filas como objetos planos */
  query(sql: string, params?: (string | number | boolean | null)[]): Promise<Record<string, unknown>[]>;

  /** Devuelve los nombres de todas las tablas */
  listTables(): Promise<string[]>;

  /** Devuelve las columnas de una tabla (nombre, tipo, nullable, pk, default) */
  getColumnInfo(tableName: string): Promise<ColumnInfo[]>;

  close(): Promise<void>;
}

export interface ColumnInfo {
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
  defaultValue: unknown;
}
