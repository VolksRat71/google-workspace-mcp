import { drive_v3 } from 'googleapis';
import { deleteSnapshot as deleteSnapshotUtil } from '../../utils/snapshotManager.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

export interface DeleteSnapshotArgs {
  snapshotId: string;
}

/**
 * Permanently deletes a snapshot from Google Drive.
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for deleting a snapshot
 * @returns A promise resolving to the MCP response content
 */
export const deleteSnapshotTool = async (drive: drive_v3.Drive, args: DeleteSnapshotArgs) => {
  try {
    await deleteSnapshotUtil(drive, args.snapshotId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Snapshot ${args.snapshotId} has been permanently deleted`,
              snapshotId: args.snapshotId,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'delete_snapshot');
  }
};
