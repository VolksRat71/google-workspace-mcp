import { drive_v3 } from 'googleapis';
import { GetFileArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export const getFileTool = async (drive: drive_v3.Drive, args: GetFileArgs) => {
  try {
    const response = await drive.files.get({
      fileId: args.fileId,
      fields:
        'id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink, webContentLink, iconLink, description, starred, trashed, owners, sharingUser, permissions, capabilities, driveId',
      supportsAllDrives: true,
    });

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'get_file');
  }
};
