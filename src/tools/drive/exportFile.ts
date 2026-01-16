import { drive_v3 } from 'googleapis';
import { ExportFileArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export const exportFileTool = async (drive: drive_v3.Drive, args: ExportFileArgs) => {
  try {
    const response = await drive.files.export({
      fileId: args.fileId,
      mimeType: args.mimeType,
    });

    // The response data can be a string or binary depending on the export format
    const data = response.data;

    // If the data is a string (text formats), return it directly
    if (typeof data === 'string') {
      return {
        content: [{ type: 'text' as const, text: data }],
      };
    }

    // For other formats, stringify the data
    return {
      content: [
        {
          type: 'text' as const,
          text: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'export_file');
  }
};
