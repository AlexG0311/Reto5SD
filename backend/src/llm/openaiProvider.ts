import OpenAI from 'openai';
import { ILlmProvider, LlmTurnResult, ToolCall, ToolResult } from './ILlmProvider.js';
import { McpTool } from '../mcpClient.js';

export class OpenAIProvider implements ILlmProvider {
  private client: OpenAI;
  private tools: OpenAI.Chat.ChatCompletionTool[] = [];
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  initTools(tools: McpTool[]): void {
    this.tools = tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description ?? '',
        parameters: tool.inputSchema,
      },
    }));
  }

  async startConversation(systemPrompt: string, userMessage: string): Promise<LlmTurnResult> {
    this.messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    return this.callApi();
  }

  async sendToolResults(results: ToolResult[]): Promise<LlmTurnResult> {
    for (const result of results) {
      this.messages.push({
        role: 'tool',
        tool_call_id: result.toolCallId,
        content: result.content,
      });
    }
    return this.callApi();
  }

  private async callApi(): Promise<LlmTurnResult> {
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o',
      messages: this.messages,
      tools: this.tools,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const msg = choice.message;
    this.messages.push(msg);

    if (choice.finish_reason === 'stop' || !msg.tool_calls?.length) {
      return { finished: true, content: msg.content ?? '' };
    }

    const toolCalls: ToolCall[] = msg.tool_calls
      .filter((tc) => tc.type === 'function')
      .map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      }));

    return { finished: false, toolCalls };
  }
}
