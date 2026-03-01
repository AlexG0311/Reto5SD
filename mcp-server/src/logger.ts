import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DIR = path.resolve(__dirname, '../logs');
const LOG_FILE = path.join(LOGS_DIR, 'queries.log');

// Crear directorio de logs si no existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export interface LogEntry {
  timestamp: string;
  tool: string;
  input: unknown;
  sql?: string;
  rowCount?: number;
  error?: string;
  durationMs: number;
}

export function logToolInvocation(entry: LogEntry): void {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LOG_FILE, line, 'utf-8');

  // También mostrar en consola para diagnóstico
  const status = entry.error ? '❌ ERROR' : '✅ OK';
  console.error(
    `[${entry.timestamp}] ${status} | tool=${entry.tool} | duration=${entry.durationMs}ms${
      entry.sql ? ` | sql=${entry.sql.substring(0, 80)}...` : ''
    }${entry.error ? ` | error=${entry.error}` : ''}`
  );
}
