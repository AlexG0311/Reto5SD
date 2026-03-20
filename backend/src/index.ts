import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import createQueryRouter from './routes/query.js';
import { McpClientService } from './mcpClient.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const mcpClient = new McpClientService();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));  // Puerto de Vite
app.use(express.json());

// Rutas
app.use('/api/query', createQueryRouter(mcpClient));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function bootstrap(): Promise<void> {
  await mcpClient.connect();

  app.listen(PORT, () => {
    console.log(`[Backend] Servidor corriendo en http://localhost:${PORT}`);
    console.log(`[Backend] OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ configurada' : '❌ NO configurada'}`);
  });
}

async function shutdown(signal: string): Promise<void> {
  console.log(`[Backend] Recibida señal ${signal}. Cerrando MCP Client...`);
  try {
    await mcpClient.close();
  } catch (error) {
    const err = error as Error;
    console.error('[Backend] Error al cerrar MCP Client:', err.message);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

bootstrap().catch((error: unknown) => {
  const err = error as Error;
  console.error('[Backend] Error al iniciar la aplicación:', err.message);
  process.exit(1);
});
