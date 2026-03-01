import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import queryRouter from './routes/query.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));  // Puerto de Vite
app.use(express.json());

// Rutas
app.use('/api/query', queryRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Backend] Servidor corriendo en http://localhost:${PORT}`);
  console.log(`[Backend] OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ configurada' : '❌ NO configurada'}`);
});
