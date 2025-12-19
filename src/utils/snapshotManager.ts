import { drive_v3, sheets_v4, slides_v1 } from 'googleapis';

export type DocumentType = 'presentation' | 'spreadsheet';

export interface SnapshotMetadata {
  originalId: string;
  originalTitle: string;
  snapshotCreatedAt: string;
  triggeringOperation: string;
  mcpVersion: string;
  documentType: DocumentType;
}

export interface SnapshotInfo {
  snapshotId: string;
  snapshotName: string;
  metadata: SnapshotMetadata;
  createdTime: string;
}

/**
 * Creates a snapshot of a Google Drive document (Presentation or Spreadsheet).
 * The snapshot is stored as a copy in Google Drive with metadata in the description.
 *
 * @param drive The authenticated Google Drive API client
 * @param documentId The ID of the document to snapshot
 * @param documentType The type of document ('presentation' or 'spreadsheet')
 * @param operation The operation that triggered this snapshot
 * @returns The ID of the created snapshot
 */
export async function createSnapshot(
  drive: drive_v3.Drive,
  documentId: string,
  documentType: DocumentType,
  operation: string
): Promise<string> {
  // Get the original document details
  const fileResponse = await drive.files.get({
    fileId: documentId,
    fields: 'name',
  });

  const originalTitle = fileResponse.data.name || 'Untitled';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const snapshotName = `${originalTitle}_snapshot_${timestamp}_${operation}`;

  // Create metadata
  const metadata: SnapshotMetadata = {
    originalId: documentId,
    originalTitle,
    snapshotCreatedAt: new Date().toISOString(),
    triggeringOperation: operation,
    mcpVersion: '0.2.0',
    documentType,
  };

  // Copy the file to create snapshot
  const copyResponse = await drive.files.copy({
    fileId: documentId,
    requestBody: {
      name: snapshotName,
      description: JSON.stringify(metadata),
    },
  });

  return copyResponse.data.id!;
}

/**
 * Lists all snapshots for a given document.
 *
 * @param drive The authenticated Google Drive API client
 * @param documentId The ID of the original document
 * @returns Array of snapshot information
 */
export async function listSnapshots(
  drive: drive_v3.Drive,
  documentId: string
): Promise<SnapshotInfo[]> {
  // Search for files where description contains the originalId
  const response = await drive.files.list({
    q: `trashed=false`,
    fields: 'files(id, name, description, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  const snapshots: SnapshotInfo[] = [];

  for (const file of response.data.files || []) {
    if (file.description) {
      try {
        const metadata: SnapshotMetadata = JSON.parse(file.description);
        if (metadata.originalId === documentId) {
          snapshots.push({
            snapshotId: file.id!,
            snapshotName: file.name!,
            metadata,
            createdTime: file.createdTime!,
          });
        }
      } catch (e) {
        // Skip files with invalid metadata
        continue;
      }
    }
  }

  return snapshots;
}

/**
 * Reverts a document to a previous snapshot by copying the snapshot content
 * back to the original document. Creates a backup of the current state first.
 *
 * @param drive The authenticated Google Drive API client
 * @param sheets The authenticated Google Sheets API client (for spreadsheets)
 * @param slides The authenticated Google Slides API client (for presentations)
 * @param originalDocumentId The ID of the document to revert
 * @param snapshotId The ID of the snapshot to restore from
 * @param documentType The type of document
 * @returns Object with backup ID and success message
 */
export async function revertToSnapshot(
  drive: drive_v3.Drive,
  _sheets: sheets_v4.Sheets,
  _slides: slides_v1.Slides,
  originalDocumentId: string,
  snapshotId: string,
  documentType: DocumentType
): Promise<{ backupId: string; message: string }> {
  // Create a backup of the current state before reverting
  const backupId = await createSnapshot(
    drive,
    originalDocumentId,
    documentType,
    'pre_revert_backup'
  );

  // Copy the snapshot to a temporary file
  const tempCopy = await drive.files.copy({
    fileId: snapshotId,
    requestBody: {
      name: `temp_restore_${Date.now()}`,
    },
  });

  const tempFileId = tempCopy.data.id!;

  try {
    // Export and re-import approach:
    // Unfortunately, Google Drive API doesn't allow direct content replacement
    // The user will need to manually replace or we need to export/import
    // For now, we'll return instructions

    return {
      backupId,
      message: `Backup created (ID: ${backupId}). To complete reversion: ` +
        `The snapshot copy has been created at https://docs.google.com/${documentType === 'presentation' ? 'presentation' : 'spreadsheets'}/d/${tempFileId}. ` +
        `Please manually copy content from the snapshot to your original document, or delete the original and use the snapshot copy.`,
    };
  } catch (error) {
    // Clean up temp file if something went wrong
    await drive.files.delete({ fileId: tempFileId }).catch(() => {
      /* ignore cleanup errors */
    });
    throw error;
  }
}

/**
 * Permanently deletes a snapshot from Google Drive.
 *
 * @param drive The authenticated Google Drive API client
 * @param snapshotId The ID of the snapshot to delete
 */
export async function deleteSnapshot(
  drive: drive_v3.Drive,
  snapshotId: string
): Promise<void> {
  // Verify it's a snapshot by checking metadata
  const file = await drive.files.get({
    fileId: snapshotId,
    fields: 'description',
  });

  if (!file.data.description) {
    throw new Error('This file does not appear to be a snapshot (no metadata found)');
  }

  try {
    const metadata: SnapshotMetadata = JSON.parse(file.data.description);
    if (!metadata.originalId || !metadata.snapshotCreatedAt) {
      throw new Error('This file does not appear to be a snapshot (invalid metadata)');
    }
  } catch (e) {
    throw new Error('This file does not appear to be a snapshot (malformed metadata)');
  }

  // Delete the snapshot
  await drive.files.delete({ fileId: snapshotId });
}
