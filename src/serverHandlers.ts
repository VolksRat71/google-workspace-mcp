import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { slides_v1, sheets_v4, drive_v3, docs_v1 } from 'googleapis';
import { CONFIG, getEnabledModules } from './config.js';
import * as driveModule from './tools/drive/index.js';
import * as slidesModule from './tools/slides/index.js';
import * as sheetsModule from './tools/sheets/index.js';
import * as docsModule from './tools/docs/index.js';
import * as revisionsModule from './tools/revisions/index.js';

type ToolHandler = (args: unknown) => Promise<{ content: { type: string; text: string }[] }>;

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const setupToolHandlers = (
  server: Server,
  slides: slides_v1.Slides,
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive,
  docs: docs_v1.Docs
) => {
  // Log enabled modules at startup
  const enabledModules = getEnabledModules();
  console.error(`Enabled modules: ${enabledModules.join(', ')}`);

  // Build tools list based on config
  const allTools: ToolDefinition[] = [];
  const allHandlers: Record<string, ToolHandler> = {};

  // Drive tools are always enabled
  allTools.push(...driveModule.tools);
  Object.assign(allHandlers, driveModule.createHandlers(drive));

  // Conditionally add other modules
  if (CONFIG.enableSlides) {
    allTools.push(...slidesModule.tools);
    Object.assign(allHandlers, slidesModule.createHandlers(slides));
  }

  if (CONFIG.enableSheets) {
    allTools.push(...sheetsModule.tools);
    Object.assign(allHandlers, sheetsModule.createHandlers(sheets));
  }

  if (CONFIG.enableDocs) {
    allTools.push(...docsModule.tools);
    Object.assign(allHandlers, docsModule.createHandlers(docs));
  }

  if (CONFIG.enableRevisions) {
    allTools.push(...revisionsModule.tools);
    Object.assign(allHandlers, revisionsModule.createHandlers(drive));
  }

  console.error(`Registered ${allTools.length} tools`);

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools,
  }));

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (args === undefined) {
        throw new McpError(ErrorCode.InvalidParams, `Missing arguments for tool "${name}".`);
      }

      const handler = allHandlers[name];
      if (!handler) {
        return {
          content: [{ type: 'text', text: `Unknown tool requested: ${name}` }],
          isError: true,
          errorCode: ErrorCode.MethodNotFound,
        };
      }

      return await handler(args);
    } catch (error: unknown) {
      console.error(`Error executing tool "${name}":`, error);

      if (error instanceof McpError) {
        return {
          content: [{ type: 'text', text: error.message }],
          isError: true,
          errorCode: error.code,
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error executing tool "${name}": ${errorMessage}` }],
        isError: true,
        errorCode: ErrorCode.InternalError,
      };
    }
  });
};
