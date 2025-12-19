import { drive_v3 } from 'googleapis';
import { createSnapshot as createSnapshotUtil, DocumentType } from '../../utils/snapshotManager.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export interface CreateSnapshotArgs {
  documentId: string;
  documentType: DocumentType;
  label?: string;
}

/**
 * Creates a snapshot of a Google Workspace document (Presentation or Spreadsheet).
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for creating a snapshot
 * @returns A promise resolving to the MCP response content
 */
export const createSnapshotTool = async (drive: drive_v3.Drive, args: CreateSnapshotArgs) => {
  try {
    const operation = args.label || 'manual_snapshot';
    const snapshotId = await createSnapshotUtil(drive, args.documentId, args.documentType, operation);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              snapshotId,
              message: `Snapshot created successfully for ${args.documentType} ${args.documentId}`,
              documentId: args.documentId,
              documentType: args.documentType,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'create_snapshot');
  }
};
