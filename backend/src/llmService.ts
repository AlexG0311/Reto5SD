import { McpClientService } from './mcpClient.js';
import { ToolResult } from './llm/ILlmProvider.js';
import { createLlmProvider } from './llm/llmProviderFactory.js';

const SYSTEM_PROMPT = `Eres un asistente experto en la base de datos Chinook, una base de datos de música digital.
La base de datos contiene información sobre artistas, álbumes, canciones, clientes, facturas y empleados.

REGLAS OBLIGATORIAS:
1. SOLO puedes interactuar con la base de datos usando las herramientas MCP disponibles.
2. NUNCA generes SQL que no sea SELECT. Está terminantemente prohibido modificar datos.
3. Proceso que DEBES seguir en cada consulta:
   a. Siempre llama a get_schema o list_tables antes de responder. No asumas la estructura de la base de datos.
   b. Usa execute_query con el SELECT apropiado.
   c. Responde en español con los datos obtenidos de forma clara y concisa.
4. Si no puedes responder con los datos disponibles, indícalo claramente.
5. Para números monetarios, muestra el símbolo de moneda apropiado.
6. Si la pregunta no tiene nada que ver con la base de datos, responde que solo puedes responder preguntas relacionadas con la base de datos Chinook.`;

export interface LlmResponse {
  generatedSQL: string;
  rawResults: Record<string, unknown>[];
  naturalLanguageAnswer: string;
}

export async function processQuestion(
  question: string,
  mcpClient: McpClientService
): Promise<LlmResponse> {
  const provider = createLlmProvider();
  const mcpTools = await mcpClient.listTools();
  provider.initTools(mcpTools);

  let generatedSQL = '';
  let rawResults: Record<string, unknown>[] = [];

  // Primer turno: enviar la pregunta del usuario
  let turn = await provider.startConversation(SYSTEM_PROMPT, question);

  // Bucle agéntico: el LLM puede hacer múltiples tool calls antes de responder
  const MAX_TOOL_TURNS = 10;
  let turnCount = 0;

  while (!turn.finished && turnCount < MAX_TOOL_TURNS) {
    turnCount++;
    const toolResults: ToolResult[] = [];

    for (const toolCall of turn.toolCalls ?? []) {
      console.log(`[TOOL CALL] ${toolCall.name}`, toolCall.args); 

      let content: string;
      try {
        content = await mcpClient.callTool(toolCall.name, toolCall.args);

        // Capturar SQL y resultados si es execute_query
        if (toolCall.name === 'execute_query' && toolCall.args.sql) {
          generatedSQL = toolCall.args.sql as string;
          try {
            const parsed = JSON.parse(content) as { rows?: Record<string, unknown>[] };
            rawResults = parsed.rows ?? [];
          } catch {
            rawResults = [];
          }
        }
      } catch (error) {
        content = JSON.stringify({ error: (error as Error).message });
      }

      toolResults.push({ toolCallId: toolCall.id, name: toolCall.name, content });
    }

    // Devolver los resultados al proveedor para continuar
    turn = await provider.sendToolResults(toolResults);
  }

  if (turnCount >= MAX_TOOL_TURNS) {
    console.warn(`[LLM] Se alcanzó el límite de ${MAX_TOOL_TURNS} turnos de herramientas.`);
  }

  return {
    generatedSQL,
    rawResults,
    naturalLanguageAnswer: turn.content ?? 'No se pudo generar una respuesta.',
  };
}
