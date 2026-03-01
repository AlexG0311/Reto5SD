import { Router, Request, Response } from 'express';
import { McpClientService } from '../mcpClient.js';
import { processQuestion } from '../llmService.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { question } = req.body as { question?: string };

  if (!question || question.trim() === '') {
    res.status(400).json({ error: 'El campo "question" es requerido.' });
    return;
  }

  const mcpClient = new McpClientService();

  try {
    await mcpClient.connect();

    const result = await processQuestion(question.trim(), mcpClient);

    res.json({
      question: question.trim(),
      generatedSQL: result.generatedSQL,
      rawResults: result.rawResults,
      naturalLanguageAnswer: result.naturalLanguageAnswer,
    });
  } catch (error) {
    const err = error as Error;
    console.error('[/api/query] Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    await mcpClient.close();
  }
});

export default router;
