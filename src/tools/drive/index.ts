import { drive_v3 } from 'googleapis';
import {
  CreateFolderArgsSchema,
  ListFilesArgsSchema,
  GetFileArgsSchema,
  SearchFilesArgsSchema,
  ExportFileArgsSchema,
} from '../../schemas.js';
import { createFolderTool } from './createFolder.js';
import { listFilesTool } from './listFiles.js';
import { getFileTool } from './getFile.js';
import { searchFilesTool } from './searchFiles.js';
import { exportFileTool } from './exportFile.js';

export const tools = [
  {
    name: 'create_folder',
    description: 'Create a new folder in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the folder to create.',
        },
        parentFolderId: {
          type: 'string',
          description: 'Optional. The ID of the parent folder. If not specified, creates in root.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_files',
    description:
      'List files and folders in Google Drive. Can filter by folder, MIME type, and supports pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Optional. The ID of the folder to list contents of. Defaults to root if not specified.',
        },
        pageSize: {
          type: 'number',
          description: 'Optional. Number of results to return (default 20, max 100).',
        },
        pageToken: {
          type: 'string',
          description: 'Optional. Token for pagination to retrieve the next page of results.',
        },
        orderBy: {
          type: 'string',
          description:
            'Optional. Sort order for results (e.g., "name", "modifiedTime desc", "createdTime").',
        },
        mimeType: {
          type: 'string',
          description:
            'Optional. Filter by MIME type (e.g., "application/vnd.google-apps.folder" for folders only).',
        },
        includeTrashed: {
          type: 'boolean',
          description: 'Optional. Include trashed files in results (default false).',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_file',
    description: 'Get detailed metadata for a specific file in Google Drive.',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file to get metadata for.',
        },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'search_files',
    description:
      'Search for files in Google Drive using query syntax. Examples: "name contains \'report\'", "mimeType = \'application/pdf\'", "modifiedTime > \'2024-01-01\'".',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The search query using Drive query syntax (e.g., "name contains \'report\'", "fullText contains \'budget\'").',
        },
        pageSize: {
          type: 'number',
          description: 'Optional. Number of results to return (default 20, max 100).',
        },
        pageToken: {
          type: 'string',
          description: 'Optional. Token for pagination to retrieve the next page of results.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'export_file',
    description:
      'Export a Google Docs, Sheets, or Slides file to another format (PDF, text, CSV, etc.). Only works with Google Workspace files.',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the Google Docs/Sheets/Slides file to export.',
        },
        mimeType: {
          type: 'string',
          description:
            'The target MIME type for export. Common options: "application/pdf", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" (docx).',
        },
      },
      required: ['fileId', 'mimeType'],
    },
  },
];

export const createHandlers = (drive: drive_v3.Drive) => ({
  create_folder: async (args: unknown) => {
    const parsedArgs = CreateFolderArgsSchema.parse(args);
    return await createFolderTool(drive, parsedArgs);
  },
  list_files: async (args: unknown) => {
    const parsedArgs = ListFilesArgsSchema.parse(args);
    return await listFilesTool(drive, parsedArgs);
  },
  get_file: async (args: unknown) => {
    const parsedArgs = GetFileArgsSchema.parse(args);
    return await getFileTool(drive, parsedArgs);
  },
  search_files: async (args: unknown) => {
    const parsedArgs = SearchFilesArgsSchema.parse(args);
    return await searchFilesTool(drive, parsedArgs);
  },
  export_file: async (args: unknown) => {
    const parsedArgs = ExportFileArgsSchema.parse(args);
    return await exportFileTool(drive, parsedArgs);
  },
});
