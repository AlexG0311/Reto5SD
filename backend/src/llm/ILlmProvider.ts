import { McpTool } from '../mcpClient.js';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  content: string;
}

export interface LlmTurnResult {
  /** true = el modelo terminó y devolvió texto final */
  finished: boolean;
  content?: string;
  toolCalls?: ToolCall[];
}

/**
 * Contrato que debe implementar cualquier proveedor de LLM.
 * Para agregar un nuevo proveedor: implementa esta interfaz y
 * regístralo en llmProviderFactory.ts.
 */
export interface ILlmProvider {
  /** Configura las herramientas MCP disponibles para el modelo */
  initTools(tools: McpTool[]): void;

  /** Envía el primer mensaje del usuario e inicia la conversación */
  startConversation(systemPrompt: string, userMessage: string): Promise<LlmTurnResult>;

  /** Devuelve los resultados de las tool calls al modelo y obtiene la siguiente respuesta */
  sendToolResults(results: ToolResult[]): Promise<LlmTurnResult>;
}
