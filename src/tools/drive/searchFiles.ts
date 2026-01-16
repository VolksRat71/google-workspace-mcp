import { drive_v3 } from 'googleapis';
import { SearchFilesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export const searchFilesTool = async (drive: drive_v3.Drive, args: SearchFilesArgs) => {
  try {
    const response = await drive.files.list({
      q: args.query,
      pageSize: args.pageSize || 20,
      pageToken: args.pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink, iconLink, driveId)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'search_files');
  }
};
