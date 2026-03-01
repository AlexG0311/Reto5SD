import { McpClientService } from './mcpClient.js';
import { ToolResult } from './llm/ILlmProvider.js';
import { createLlmProvider } from './llm/llmProviderFactory.js';

const SYSTEM_PROMPT = `Eres un asistente experto en la base de datos Chinook, una base de datos de música digital.
La base de datos contiene información sobre artistas, álbumes, canciones, clientes, facturas y empleados.

REGLAS OBLIGATORIAS:
1. SOLO puedes interactuar con la base de datos usando las herramientas MCP disponibles.
2. NUNCA generes SQL que no sea SELECT. Está terminantemente prohibido modificar datos.
3. Proceso que DEBES seguir en cada consulta:
   a. Usa get_schema o list_tables para entender la estructura si es necesario.
   b. Usa execute_query con el SELECT apropiado.
   c. Responde en español con los datos obtenidos de forma clara y concisa.
4. Si no puedes responder con los datos disponibles, indícalo claramente.
5. Para números monetarios, muestra el símbolo de moneda apropiado.`;

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
  while (!turn.finished) {
    const toolResults: ToolResult[] = [];

    for (const toolCall of turn.toolCalls ?? []) {
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

  return {
    generatedSQL,
    rawResults,
    naturalLanguageAnswer: turn.content ?? 'No se pudo generar una respuesta.',
  };
}
