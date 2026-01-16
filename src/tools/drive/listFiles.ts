import { drive_v3 } from 'googleapis';
import { ListFilesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

const buildQuery = (args: ListFilesArgs): string => {
  const queryParts: string[] = [];

  if (args.folderId) {
    queryParts.push(`'${args.folderId}' in parents`);
  }

  if (args.mimeType) {
    queryParts.push(`mimeType = '${args.mimeType}'`);
  }

  if (!args.includeTrashed) {
    queryParts.push('trashed = false');
  }

  return queryParts.length > 0 ? queryParts.join(' and ') : undefined!;
};

export const listFilesTool = async (drive: drive_v3.Drive, args: ListFilesArgs) => {
  try {
    const query = buildQuery(args);

    const response = await drive.files.list({
      q: query || undefined,
      pageSize: args.pageSize || 20,
      pageToken: args.pageToken,
      orderBy: args.orderBy,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, parents, webViewLink, iconLink, driveId)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'list_files');
  }
};
