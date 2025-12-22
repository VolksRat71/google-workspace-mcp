import { drive_v3 } from 'googleapis';
import { CreateFolderArgsSchema } from '../../schemas.js';
import { createFolderTool } from './createFolder.js';

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
];

export const createHandlers = (drive: drive_v3.Drive) => ({
  create_folder: async (args: unknown) => {
    const parsedArgs = CreateFolderArgsSchema.parse(args);
    return await createFolderTool(drive, parsedArgs);
  },
});
