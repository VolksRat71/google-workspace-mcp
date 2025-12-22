import { sheets_v4 } from 'googleapis';
import {
  CreateSpreadsheetArgsSchema,
  GetSpreadsheetArgsSchema,
  GetSheetValuesArgsSchema,
  UpdateSheetValuesArgsSchema,
  BatchUpdateSpreadsheetArgsSchema,
  AppendSheetValuesArgsSchema,
  SummarizeSpreadsheetArgsSchema,
  CopySheetArgsSchema,
} from '../../schemas.js';
import { createSpreadsheetTool } from './createSpreadsheet.js';
import { getSpreadsheetTool } from './getSpreadsheet.js';
import { getSheetValuesTool } from './getSheetValues.js';
import { updateSheetValuesTool } from './updateSheetValues.js';
import { batchUpdateSpreadsheetTool } from './batchUpdateSpreadsheet.js';
import { appendSheetValuesTool } from './appendSheetValues.js';
import { summarizeSpreadsheetTool } from './summarizeSpreadsheet.js';
import { copySheetTool } from './copySheet.js';

export const tools = [
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
];

export const createHandlers = (sheets: sheets_v4.Sheets) => ({
  create_spreadsheet: async (args: unknown) => {
    const parsedArgs = CreateSpreadsheetArgsSchema.parse(args);
    return await createSpreadsheetTool(sheets, parsedArgs);
  },
  get_spreadsheet: async (args: unknown) => {
    const parsedArgs = GetSpreadsheetArgsSchema.parse(args);
    return await getSpreadsheetTool(sheets, parsedArgs);
  },
  get_sheet_values: async (args: unknown) => {
    const parsedArgs = GetSheetValuesArgsSchema.parse(args);
    return await getSheetValuesTool(sheets, parsedArgs);
  },
  update_sheet_values: async (args: unknown) => {
    const parsedArgs = UpdateSheetValuesArgsSchema.parse(args);
    return await updateSheetValuesTool(sheets, parsedArgs);
  },
  batch_update_spreadsheet: async (args: unknown) => {
    const parsedArgs = BatchUpdateSpreadsheetArgsSchema.parse(args);
    return await batchUpdateSpreadsheetTool(sheets, parsedArgs);
  },
  append_sheet_values: async (args: unknown) => {
    const parsedArgs = AppendSheetValuesArgsSchema.parse(args);
    return await appendSheetValuesTool(sheets, parsedArgs);
  },
  summarize_spreadsheet: async (args: unknown) => {
    const parsedArgs = SummarizeSpreadsheetArgsSchema.parse(args);
    return await summarizeSpreadsheetTool(sheets, parsedArgs);
  },
  copy_sheet: async (args: unknown) => {
    const parsedArgs = CopySheetArgsSchema.parse(args);
    return await copySheetTool(sheets, parsedArgs);
  },
});
