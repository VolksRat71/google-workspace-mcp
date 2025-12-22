import { drive_v3 } from 'googleapis';
import { ListRevisionsArgsSchema, GetRevisionArgsSchema } from '../../schemas.js';
import { listRevisions, getRevision } from '../../utils/revisionManager.js';

export const tools = [
  {
    name: 'list_revisions',
    description: 'List version history for a Google Sheets, Slides, or Docs document',
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
          enum: ['presentation', 'spreadsheet', 'document'],
          description: 'The type of document.',
        },
      },
      required: ['documentId', 'revisionId', 'documentType'],
    },
  },
];

export const createHandlers = (drive: drive_v3.Drive) => ({
  list_revisions: async (args: unknown) => {
    const parsedArgs = ListRevisionsArgsSchema.parse(args);
    const revisions = await listRevisions(drive, parsedArgs.documentId);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(revisions, null, 2) }],
    };
  },
  get_revision: async (args: unknown) => {
    const parsedArgs = GetRevisionArgsSchema.parse(args);
    const result = await getRevision(
      drive,
      parsedArgs.documentId,
      parsedArgs.revisionId,
      parsedArgs.documentType
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
});
