import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVER_PATH = path.resolve(
  __dirname,
  process.env.MCP_SERVER_PATH ?? '../../mcp-server/dist/index.js'
);

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpCallResult {
  content: { type: string; text: string }[];
}

export class McpClientService {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: [MCP_SERVER_PATH],
    });

    this.client = new Client({
      name: 'backend-mcp-client',
      version: '1.0.0',
    });
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('[MCP Client] Conectado al MCP Server');
  }

  async listTools(): Promise<McpTool[]> {
    const response = await this.client.listTools();
    return response.tools as McpTool[];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const response = await this.client.callTool({ name, arguments: args });
    const result = response as McpCallResult;
    const textContent = result.content.find((c) => c.type === 'text');
    return textContent?.text ?? '';
  }
  
  async close(): Promise<void> {
    await this.client.close();
  }
}
