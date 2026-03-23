import { IDatabase } from './IDatabase.js';
import { SQLiteProvider } from './sqliteProvider.js';


// Para agregar un nuevo proveedor:
// 1. Crea su clase implementando IDatabase en un archivo nuevo
// 2. Impórtala aquí y agrégala al mapa con su clave
const PROVIDERS: Record<string, () => IDatabase> = {
  sqlite: () => new SQLiteProvider(),
};

export function createDbProvider(): IDatabase {
  const name = (process.env.DB_PROVIDER ?? 'sqlite').toLowerCase();
  const factory = PROVIDERS[name];

  if (!factory) {
    const valid = Object.keys(PROVIDERS).join(', ');
    throw new Error(`Proveedor DB desconocido: "${name}". Opciones válidas: ${valid}`);
  }

  console.error(`[MCP Server] Usando proveedor DB: ${name}`);
  return factory();
}
