import { QueryExecutor, QueryExecutionResult } from '../services/queryExecutor.js';
import { QueryValidator } from '../services/queryValidator.js';
import { logToolInvocation } from '../logger.js';

export type QueryResult = QueryExecutionResult;

export async function executeQuery(sql: string): Promise<QueryResult> {
  const start = Date.now();
  const tool = 'execute_query';
  const input = { sql };
  const validator = new QueryValidator();
  const executor = new QueryExecutor();

  // 1. Validar antes de cualquier interacción con la DB
  const validation = validator.validate(sql);
  if (!validation.valid) {
    const message = validation.errors.join('; ');
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      error: `VALIDATION_ERROR: ${message}`,
      durationMs: Date.now() - start,
    });
    throw new Error(message);
  }

  // 2. Ejecutar la query (solo si la validación fue exitosa)
  try {
    const result = await executor.execute(sql);

    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      rowCount: result.rowCount,
      durationMs: Date.now() - start,
    });

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logToolInvocation({
      timestamp: new Date().toISOString(),
      tool,
      input,
      sql,
      error: `EXECUTION_ERROR: ${message}`,
      durationMs: Date.now() - start,
    });
    throw error;
  }
}
