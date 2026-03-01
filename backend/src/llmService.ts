import OpenAI from 'openai';
import { McpClientService, McpTool } from './mcpClient.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

function mcpToolsToOpenAITools(tools: McpTool[]): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description ?? '',
      parameters: tool.inputSchema,
    },
  }));
}

export async function processQuestion(
  question: string,
  mcpClient: McpClientService
): Promise<LlmResponse> {
  const mcpTools = await mcpClient.listTools();
  const openAITools = mcpToolsToOpenAITools(mcpTools);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: question },
  ];

  let generatedSQL = '';
  let rawResults: Record<string, unknown>[] = [];

  // Bucle agentico: el LLM puede hacer múltiples tool calls
  while (true) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: openAITools,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    // Si no hay más tool calls, el LLM ya terminó
    if (choice.finish_reason === 'stop' || !assistantMessage.tool_calls?.length) {
      return {
        generatedSQL,
        rawResults,
        naturalLanguageAnswer: assistantMessage.content ?? 'No se pudo generar una respuesta.',
      };
    }

    // Ejecutar cada tool call vía MCP (solo tipo 'function')
    const functionCalls = assistantMessage.tool_calls.filter((tc) => tc.type === 'function');
    for (const toolCall of functionCalls) {
      const fn = (toolCall as { type: 'function'; id: string; function: { name: string; arguments: string } }).function;
      const toolName = fn.name;
      const toolArgs = JSON.parse(fn.arguments) as Record<string, unknown>;

      let toolResult: string;

      try {
        toolResult = await mcpClient.callTool(toolName, toolArgs);

        // Capturar el SQL generado si es execute_query
        if (toolName === 'execute_query' && toolArgs.sql) {
          generatedSQL = toolArgs.sql as string;
          try {
            const parsed = JSON.parse(toolResult) as { rows?: Record<string, unknown>[] };
            rawResults = parsed.rows ?? [];
          } catch {
            rawResults = [];
          }
        }
      } catch (error) {
        const err = error as Error;
        toolResult = JSON.stringify({ error: err.message });
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }
  }
}
