import { GoogleGenAI, Chat, FunctionCallingConfigMode, GenerateContentResponse } from '@google/genai';
import { ILlmProvider, LlmTurnResult, ToolCall, ToolResult } from './ILlmProvider.js';
import { McpTool } from '../mcpClient.js';

export class GoogleProvider implements ILlmProvider {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private mcpTools: McpTool[] = [];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY ?? '' });
  }

  initTools(tools: McpTool[]): void {
    this.mcpTools = tools;
  }

  async startConversation(systemPrompt: string, userMessage: string): Promise<LlmTurnResult> {
    this.chat = this.ai.chats.create({
      model: process.env.GOOGLE_MODEL ?? 'gemini-2.0-flash',
      config: {
        systemInstruction: systemPrompt,
        tools: [
          {
            functionDeclarations: this.mcpTools.map((t) => ({
              name: t.name,
              description: t.description ?? '',
              parameters: t.inputSchema as Record<string, unknown>,
            })),
          },
        ],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    const response = (await Promise.race([
      this.chat.sendMessage({ message: userMessage }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM timeout')), 10000) // 1s timeout
      )
    ])) as GenerateContentResponse;

    return this.parseResponse(response);
  }

  async sendToolResults(results: ToolResult[]): Promise<LlmTurnResult> {
    if (!this.chat) throw new Error('La conversación no ha sido iniciada.');

    const parts = results.map((r) => ({
      functionResponse: {
        name: r.name,
        response: { output: r.content }, // ← siempre objeto plano con string
      },
    }));

    const response = await this.chat.sendMessage({ message: parts as never });
    return this.parseResponse(response);
  }

  private parseResponse(response: GenerateContentResponse): LlmTurnResult {
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const toolCalls: ToolCall[] = functionCalls.map((fc, i) => ({
        id: `${fc.name ?? 'tool'}-${i}`,
        name: fc.name ?? 'unknown',
        args: (fc.args ?? {}) as Record<string, unknown>,
      }));
      return { finished: false, toolCalls };
    }

    return {
      finished: true,
      content: response.text ?? 'No se pudo generar una respuesta.',
    };
  }

  private tryParseJson(content: string): Record<string, unknown> {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return { result: content };
    }
  }
}
