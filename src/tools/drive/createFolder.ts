import { drive_v3 } from 'googleapis';
import { CreateFolderArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export const createFolderTool = async (drive: drive_v3.Drive, args: CreateFolderArgs) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: args.name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(args.parentFolderId && { parents: [args.parentFolderId] }),
      },
      fields: 'id, name, mimeType, webViewLink, createdTime',
    });

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'create_folder');
  }
};
