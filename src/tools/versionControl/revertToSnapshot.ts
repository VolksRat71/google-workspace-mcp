import { drive_v3, sheets_v4, slides_v1 } from 'googleapis';
import { revertToSnapshot as revertToSnapshotUtil, DocumentType } from '../../utils/snapshotManager.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export interface RevertToSnapshotArgs {
  originalDocumentId: string;
  snapshotId: string;
  documentType: DocumentType;
}

/**
 * Reverts a document to a previous snapshot.
 * Creates a backup of the current state before reverting.
 * @param drive The authenticated Google Drive API client
 * @param sheets The authenticated Google Sheets API client
 * @param slides The authenticated Google Slides API client
 * @param args The arguments for reverting to a snapshot
 * @returns A promise resolving to the MCP response content
 */
export const revertToSnapshotTool = async (
  drive: drive_v3.Drive,
  sheets: sheets_v4.Sheets,
  slides: slides_v1.Slides,
  args: RevertToSnapshotArgs
) => {
  try {
    const result = await revertToSnapshotUtil(
      drive,
      sheets,
      slides,
      args.originalDocumentId,
      args.snapshotId,
      args.documentType
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              backupId: result.backupId,
              message: result.message,
              originalDocumentId: args.originalDocumentId,
              snapshotId: args.snapshotId,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'revert_to_snapshot');
  }
};
