import { sheets_v4, drive_v3 } from 'googleapis';
import { BatchUpdateSpreadsheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';
import { createSnapshot } from '../../utils/snapshotManager.js';

/**
 * Applies batch formatting and structural changes to a Google Sheets spreadsheet.
 * Creates a snapshot before modifying unless skipSnapshot is true.
 * @param sheets The authenticated Google Sheets API client
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for batch updating a spreadsheet
 * @returns A promise resolving to the MCP response content
 */
export const batchUpdateSpreadsheetTool = async (
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive,
  args: BatchUpdateSpreadsheetArgs
) => {
  try {
    // Create snapshot unless opted out
    if (!args.skipSnapshot) {
      try {
        await createSnapshot(drive, args.spreadsheetId, 'spreadsheet', 'batch_update_spreadsheet');
      } catch (snapshotError) {
        console.warn('Snapshot creation failed, proceeding with update:', snapshotError);
      }
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: args.requests,
      },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'batch_update_spreadsheet');
  }
};
