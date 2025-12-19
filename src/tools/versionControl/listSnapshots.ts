import { drive_v3 } from 'googleapis';
import { listSnapshots as listSnapshotsUtil } from '../../utils/snapshotManager.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export interface ListSnapshotsArgs {
  documentId: string;
}

/**
 * Lists all snapshots for a given document.
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for listing snapshots
 * @returns A promise resolving to the MCP response content
 */
export const listSnapshotsTool = async (drive: drive_v3.Drive, args: ListSnapshotsArgs) => {
  try {
    const snapshots = await listSnapshotsUtil(drive, args.documentId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              documentId: args.documentId,
              snapshotCount: snapshots.length,
              snapshots: snapshots.map((s) => ({
                snapshotId: s.snapshotId,
                snapshotName: s.snapshotName,
                createdTime: s.createdTime,
                operation: s.metadata.triggeringOperation,
                documentType: s.metadata.documentType,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'list_snapshots');
  }
};
