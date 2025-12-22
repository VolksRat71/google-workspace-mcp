import { docs_v1 } from 'googleapis';
import {
  CreateDocumentArgsSchema,
  GetDocumentArgsSchema,
  BatchUpdateDocumentArgsSchema,
  SummarizeDocumentArgsSchema,
} from '../../schemas.js';
import { createDocumentTool } from './createDocument.js';
import { getDocumentTool } from './getDocument.js';
import { batchUpdateDocumentTool } from './batchUpdateDocument.js';
import { summarizeDocumentTool } from './summarizeDocument.js';

export const tools = [
  {
    name: 'create_document',
    description: 'Create a new Google Document',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the document.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_document',
    description: 'Get the full content and metadata of a Google Document',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the document to retrieve.',
        },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'batch_update_document',
    description: 'Apply a batch of updates to a Google Document (insert text, delete content, format text, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the document to update.',
        },
        requests: {
          type: 'array',
          description: 'A list of update requests to apply. See Google Docs API documentation for request structures.',
          items: { type: 'object' },
        },
      },
      required: ['documentId', 'requests'],
    },
  },
  {
    name: 'summarize_document',
    description: 'Extract text content from a Google Document for summarization purposes',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the document to summarize.',
        },
      },
      required: ['documentId'],
    },
  },
];

export const createHandlers = (docs: docs_v1.Docs) => ({
  create_document: async (args: unknown) => {
    const parsedArgs = CreateDocumentArgsSchema.parse(args);
    return await createDocumentTool(docs, parsedArgs);
  },
  get_document: async (args: unknown) => {
    const parsedArgs = GetDocumentArgsSchema.parse(args);
    return await getDocumentTool(docs, parsedArgs);
  },
  batch_update_document: async (args: unknown) => {
    const parsedArgs = BatchUpdateDocumentArgsSchema.parse(args);
    return await batchUpdateDocumentTool(docs, parsedArgs);
  },
  summarize_document: async (args: unknown) => {
    const parsedArgs = SummarizeDocumentArgsSchema.parse(args);
    return await summarizeDocumentTool(docs, parsedArgs);
  },
});
