import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { slides_v1, sheets_v4, drive_v3 } from 'googleapis';
import {
  CreatePresentationArgsSchema,
  GetPresentationArgsSchema,
  BatchUpdatePresentationArgsSchema,
  GetPageArgsSchema,
  SummarizePresentationArgsSchema,
  ListRevisionsArgsSchema,
  GetRevisionArgsSchema,
  CreateSpreadsheetArgsSchema,
  GetSpreadsheetArgsSchema,
  GetSheetValuesArgsSchema,
  UpdateSheetValuesArgsSchema,
  BatchUpdateSpreadsheetArgsSchema,
  AppendSheetValuesArgsSchema,
  SummarizeSpreadsheetArgsSchema,
  CopySheetArgsSchema,
} from './schemas.js';
import { createPresentationTool } from './tools/slides/createPresentation.js';
import { getPresentationTool } from './tools/slides/getPresentation.js';
import { batchUpdatePresentationTool } from './tools/slides/batchUpdatePresentation.js';
import { getPageTool } from './tools/slides/getPage.js';
import { summarizePresentationTool } from './tools/slides/summarizePresentation.js';
import { createSpreadsheetTool } from './tools/sheets/createSpreadsheet.js';
import { getSpreadsheetTool } from './tools/sheets/getSpreadsheet.js';
import { getSheetValuesTool } from './tools/sheets/getSheetValues.js';
import { updateSheetValuesTool } from './tools/sheets/updateSheetValues.js';
import { batchUpdateSpreadsheetTool } from './tools/sheets/batchUpdateSpreadsheet.js';
import { appendSheetValuesTool } from './tools/sheets/appendSheetValues.js';
import { summarizeSpreadsheetTool } from './tools/sheets/summarizeSpreadsheet.js';
import { copySheetTool } from './tools/sheets/copySheet.js';
import { listRevisions, getRevision } from './utils/revisionManager.js';
import { executeTool } from './utils/toolExecutor.js';

export const setupToolHandlers = (
  server: Server,
  slides: slides_v1.Slides,
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive
) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'create_presentation',
        description: 'Create a new Google Slides presentation',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the presentation.',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_presentation',
        description: 'Get details about a Google Slides presentation',
        inputSchema: {
          type: 'object',
          properties: {
            presentationId: {
              type: 'string',
              description: 'The ID of the presentation to retrieve.',
            },
            fields: {
              type: 'string',
              description:
                'Optional. A mask specifying which fields to include in the response (e.g., "slides,pageSize").',
            },
          },
          required: ['presentationId'],
        },
      },
      {
        name: 'batch_update_presentation',
        description: 'Apply a batch of updates to a Google Slides presentation',
        inputSchema: {
          type: 'object',
          properties: {
            presentationId: {
              type: 'string',
              description: 'The ID of the presentation to update.',
            },
            requests: {
              type: 'array',
              description:
                'A list of update requests to apply. See Google Slides API documentation for request structures.',
              items: { type: 'object' },
            },
            writeControl: {
              type: 'object',
              description: 'Optional. Provides control over how write requests are executed.',
              properties: {
                requiredRevisionId: { type: 'string' },
                targetRevisionId: { type: 'string' },
              },
            },
          },
          required: ['presentationId', 'requests'],
        },
      },
      {
        name: 'get_page',
        description: 'Get details about a specific page (slide) in a presentation',
        inputSchema: {
          type: 'object',
          properties: {
            presentationId: {
              type: 'string',
              description: 'The ID of the presentation.',
            },
            pageObjectId: {
              type: 'string',
              description: 'The object ID of the page (slide) to retrieve.',
            },
          },
          required: ['presentationId', 'pageObjectId'],
        },
      },
      {
        name: 'summarize_presentation',
        description: 'Extract text content from all slides in a presentation for summarization purposes',
        inputSchema: {
          type: 'object',
          properties: {
            presentationId: {
              type: 'string',
              description: 'The ID of the presentation to summarize.',
            },
            include_notes: {
              type: 'boolean',
              description: 'Optional. Whether to include speaker notes in the summary (default: false).',
            },
          },
          required: ['presentationId'],
        },
      },
      // ===== Google Sheets Tools =====
      {
        name: 'create_spreadsheet',
        description: 'Create a new Google Sheets spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the spreadsheet.',
            },
            sheets: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional. Array of sheet names to create.',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_spreadsheet',
        description: 'Get metadata and structure of a Google Sheets spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet to retrieve.',
            },
            fields: {
              type: 'string',
              description: 'Optional. A mask specifying which fields to include in the response.',
            },
          },
          required: ['spreadsheetId'],
        },
      },
      {
        name: 'get_sheet_values',
        description: 'Read cell values from a Google Sheets spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet.',
            },
            range: {
              type: 'string',
              description: 'The A1 notation range to retrieve (e.g., "Sheet1!A1:B10").',
            },
            valueRenderOption: {
              type: 'string',
              enum: ['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'],
              description: 'Optional. How values should be rendered (default: FORMATTED_VALUE).',
            },
          },
          required: ['spreadsheetId', 'range'],
        },
      },
      {
        name: 'update_sheet_values',
        description: 'Update cell values in a Google Sheets spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet.',
            },
            range: {
              type: 'string',
              description: 'The A1 notation range to update (e.g., "Sheet1!A1:B10").',
            },
            values: {
              type: 'array',
              items: { type: 'array' },
              description: '2D array of values to write.',
            },
            valueInputOption: {
              type: 'string',
              enum: ['RAW', 'USER_ENTERED'],
              description: 'Optional. How input data should be interpreted (default: USER_ENTERED).',
            },
          },
          required: ['spreadsheetId', 'range', 'values'],
        },
      },
      {
        name: 'batch_update_spreadsheet',
        description: 'Apply batch formatting and structural changes to a spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet.',
            },
            requests: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of update requests. See Google Sheets API documentation.',
            },
          },
          required: ['spreadsheetId', 'requests'],
        },
      },
      {
        name: 'append_sheet_values',
        description: 'Append rows to a Google Sheets spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet.',
            },
            range: {
              type: 'string',
              description: 'The A1 notation range to append to (e.g., "Sheet1!A1").',
            },
            values: {
              type: 'array',
              items: { type: 'array' },
              description: '2D array of values to append.',
            },
            valueInputOption: {
              type: 'string',
              enum: ['RAW', 'USER_ENTERED'],
              description: 'Optional. How input data should be interpreted (default: USER_ENTERED).',
            },
          },
          required: ['spreadsheetId', 'range', 'values'],
        },
      },
      {
        name: 'summarize_spreadsheet',
        description: 'Extract all data from a spreadsheet for summarization purposes',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheetId: {
              type: 'string',
              description: 'The ID of the spreadsheet to summarize.',
            },
            includeFormulas: {
              type: 'boolean',
              description: 'Optional. Include formulas instead of values (default: false).',
            },
          },
          required: ['spreadsheetId'],
        },
      },
      {
        name: 'copy_sheet',
        description: 'Copy a sheet from one spreadsheet to another, preserving all formatting and styles',
        inputSchema: {
          type: 'object',
          properties: {
            sourceSpreadsheetId: {
              type: 'string',
              description: 'The ID of the source spreadsheet.',
            },
            sourceSheetId: {
              type: 'number',
              description: 'The ID of the sheet to copy (not the name, the numeric sheetId).',
            },
            destinationSpreadsheetId: {
              type: 'string',
              description: 'The ID of the destination spreadsheet.',
            },
          },
          required: ['sourceSpreadsheetId', 'sourceSheetId', 'destinationSpreadsheetId'],
        },
      },
      // ===== Version History Tools (using Google's native revisions) =====
      {
        name: 'list_revisions',
        description: 'List version history for a Google Sheets or Slides document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'The ID of the document to list revisions for.',
            },
          },
          required: ['documentId'],
        },
      },
      {
        name: 'get_revision',
        description: 'Get details about a specific revision with instructions to restore it',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'The ID of the document.',
            },
            revisionId: {
              type: 'string',
              description: 'The ID of the revision to get details for.',
            },
            documentType: {
              type: 'string',
              enum: ['presentation', 'spreadsheet'],
              description: 'The type of document.',
            },
          },
          required: ['documentId', 'revisionId', 'documentType'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (args === undefined) {
        throw new McpError(ErrorCode.InvalidParams, `Missing arguments for tool "${name}".`);
      }

      switch (name) {
        // ===== Slides Tools =====
        case 'create_presentation':
          return executeTool(slides, name, args, CreatePresentationArgsSchema, createPresentationTool);
        case 'get_presentation':
          return executeTool(slides, name, args, GetPresentationArgsSchema, getPresentationTool);
        case 'batch_update_presentation': {
          const parsedArgs = BatchUpdatePresentationArgsSchema.parse(args);
          return await batchUpdatePresentationTool(slides, parsedArgs);
        }
        case 'get_page':
          return executeTool(slides, name, args, GetPageArgsSchema, getPageTool);
        case 'summarize_presentation':
          return executeTool(slides, name, args, SummarizePresentationArgsSchema, summarizePresentationTool);

        // ===== Sheets Tools =====
        case 'create_spreadsheet': {
          const parsedArgs = CreateSpreadsheetArgsSchema.parse(args);
          return await createSpreadsheetTool(sheets, parsedArgs);
        }
        case 'get_spreadsheet': {
          const parsedArgs = GetSpreadsheetArgsSchema.parse(args);
          return await getSpreadsheetTool(sheets, parsedArgs);
        }
        case 'get_sheet_values': {
          const parsedArgs = GetSheetValuesArgsSchema.parse(args);
          return await getSheetValuesTool(sheets, parsedArgs);
        }
        case 'update_sheet_values': {
          const parsedArgs = UpdateSheetValuesArgsSchema.parse(args);
          return await updateSheetValuesTool(sheets, parsedArgs);
        }
        case 'batch_update_spreadsheet': {
          const parsedArgs = BatchUpdateSpreadsheetArgsSchema.parse(args);
          return await batchUpdateSpreadsheetTool(sheets, parsedArgs);
        }
        case 'append_sheet_values': {
          const parsedArgs = AppendSheetValuesArgsSchema.parse(args);
          return await appendSheetValuesTool(sheets, parsedArgs);
        }
        case 'summarize_spreadsheet': {
          const parsedArgs = SummarizeSpreadsheetArgsSchema.parse(args);
          return await summarizeSpreadsheetTool(sheets, parsedArgs);
        }
        case 'copy_sheet': {
          const parsedArgs = CopySheetArgsSchema.parse(args);
          return await copySheetTool(sheets, parsedArgs);
        }

        // ===== Version History Tools =====
        case 'list_revisions': {
          const parsedArgs = ListRevisionsArgsSchema.parse(args);
          const revisions = await listRevisions(drive, parsedArgs.documentId);
          return {
            content: [{ type: 'text', text: JSON.stringify(revisions, null, 2) }],
          };
        }
        case 'get_revision': {
          const parsedArgs = GetRevisionArgsSchema.parse(args);
          const result = await getRevision(
            drive,
            parsedArgs.documentId,
            parsedArgs.revisionId,
            parsedArgs.documentType
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        default:
          return {
            content: [{ type: 'text', text: `Unknown tool requested: ${name}` }],
            isError: true,
            errorCode: ErrorCode.MethodNotFound,
          };
      }
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
