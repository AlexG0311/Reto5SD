import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { listTables } from './tools/listTables.js';
import { getSchema } from './tools/getSchema.js';
import { executeQuery } from './tools/executeQuery.js';

const server = new McpServer({
  name: 'chinook-mcp-server',
  version: '1.0.0',
});

// Tool: list_tables
server.registerTool(
  'list_tables',
  {
    description: 'Lista todas las tablas disponibles en la base de datos Chinook',
    inputSchema: {},
  },
  async () => {
    const tables = listTables();
    return {
      content: [{ type: 'text', text: JSON.stringify(tables, null, 2) }],
    };
  }
);

// Tool: get_schema
server.registerTool(
  'get_schema',
  {
    description: 'Obtiene el esquema de una tabla o de todas las tablas de Chinook',
    inputSchema: z.object({
      tableName: z.string().optional().describe('Nombre de la tabla. Si no se especifica, retorna todas.'),
    }),
  },
  async ({ tableName }) => {
    const schema = getSchema(tableName);
    return {
      content: [{ type: 'text', text: JSON.stringify(schema, null, 2) }],
    };
  }
);

// Tool: execute_query
server.registerTool(
  'execute_query',
  {
    description: 'Ejecuta una consulta SELECT sobre la base de datos Chinook. Solo se permiten consultas de lectura.',
    inputSchema: z.object({
      sql: z.string().describe('Consulta SQL SELECT a ejecutar'),
    }),
  },
  async ({ sql }) => {
    const result = executeQuery(sql);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Iniciar servidor con transporte StdIO
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[MCP Server] Chinook MCP Server iniciado con StdIO transport');
