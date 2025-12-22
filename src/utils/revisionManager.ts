import { drive_v3 } from 'googleapis';

export type DocumentType = 'presentation' | 'spreadsheet' | 'document';

export interface RevisionInfo {
  revisionId: string;
  modifiedTime: string;
  lastModifyingUser?: {
    displayName?: string;
    emailAddress?: string;
  };
  size?: string;
}

/**
 * Lists all revisions (version history) for a Google Drive document.
 * Works with both Sheets and Slides.
 *
 * @param drive The authenticated Google Drive API client
 * @param documentId The ID of the document
 * @returns Array of revision information
 */
export async function listRevisions(
  drive: drive_v3.Drive,
  documentId: string
): Promise<RevisionInfo[]> {
  const response = await drive.revisions.list({
    fileId: documentId,
    fields: 'revisions(id, modifiedTime, lastModifyingUser, size)',
    pageSize: 100,
  });

  const revisions: RevisionInfo[] = [];

  for (const revision of response.data.revisions || []) {
    revisions.push({
      revisionId: revision.id!,
      modifiedTime: revision.modifiedTime!,
      lastModifyingUser: revision.lastModifyingUser ? {
        displayName: revision.lastModifyingUser.displayName || undefined,
        emailAddress: revision.lastModifyingUser.emailAddress || undefined,
      } : undefined,
      size: revision.size || undefined,
    });
  }

  // Return newest first
  return revisions.reverse();
}

/**
 * Gets details about a specific revision and provides a link to view/restore it.
 *
 * @param drive The authenticated Google Drive API client
 * @param documentId The ID of the document
 * @param revisionId The ID of the revision
 * @param documentType The type of document ('presentation' or 'spreadsheet')
 * @returns Revision details with restore instructions
 */
export async function getRevision(
  drive: drive_v3.Drive,
  documentId: string,
  revisionId: string,
  documentType: DocumentType
): Promise<{
  revision: RevisionInfo;
  viewUrl: string;
  restoreInstructions: string;
}> {
  const response = await drive.revisions.get({
    fileId: documentId,
    revisionId: revisionId,
    fields: 'id, modifiedTime, lastModifyingUser, size',
  });

  const revision: RevisionInfo = {
    revisionId: response.data.id!,
    modifiedTime: response.data.modifiedTime!,
    lastModifyingUser: response.data.lastModifyingUser ? {
      displayName: response.data.lastModifyingUser.displayName || undefined,
      emailAddress: response.data.lastModifyingUser.emailAddress || undefined,
    } : undefined,
    size: response.data.size || undefined,
  };

  let baseUrl: string;
  switch (documentType) {
    case 'presentation':
      baseUrl = 'https://docs.google.com/presentation/d';
      break;
    case 'spreadsheet':
      baseUrl = 'https://docs.google.com/spreadsheets/d';
      break;
    case 'document':
      baseUrl = 'https://docs.google.com/document/d';
      break;
  }

  const viewUrl = `${baseUrl}/${documentId}/edit`;

  return {
    revision,
    viewUrl,
    restoreInstructions: `To restore this revision:\n` +
      `1. Open the document: ${viewUrl}\n` +
      `2. Go to File > Version history > See version history\n` +
      `3. Find the version from ${revision.modifiedTime}\n` +
      `4. Click the three dots menu and select "Restore this version"`,
  };
}

/**
 * Keeps a specific revision forever (prevents auto-deletion).
 * Useful for marking important versions.
 *
 * @param drive The authenticated Google Drive API client
 * @param documentId The ID of the document
 * @param revisionId The ID of the revision to keep
 */
export async function keepRevision(
  drive: drive_v3.Drive,
  documentId: string,
  revisionId: string
): Promise<void> {
  await drive.revisions.update({
    fileId: documentId,
    revisionId: revisionId,
    requestBody: {
      keepForever: true,
    },
  });
}

// Note: restore_revision was removed because Google Sheets/Slides revisions
// cannot be downloaded via the Drive API (they're "Google Editors" files).
// Restoring must be done through the Google UI:
// File > Version history > See version history > Restore this version
