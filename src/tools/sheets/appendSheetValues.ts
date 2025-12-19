import { sheets_v4, drive_v3 } from 'googleapis';
import { AppendSheetValuesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';
import { createSnapshot } from '../../utils/snapshotManager.js';

/**
 * Appends rows to a Google Sheets spreadsheet.
 * Creates a snapshot before modifying unless skipSnapshot is true.
 * @param sheets The authenticated Google Sheets API client
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for appending sheet values
 * @returns A promise resolving to the MCP response content
 */
export const appendSheetValuesTool = async (
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive,
  args: AppendSheetValuesArgs
) => {
  try {
    // Create snapshot unless opted out
    if (!args.skipSnapshot) {
      try {
        await createSnapshot(drive, args.spreadsheetId, 'spreadsheet', 'append_sheet_values');
      } catch (snapshotError) {
        console.warn('Snapshot creation failed, proceeding with append:', snapshotError);
      }
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: args.spreadsheetId,
      range: args.range,
      valueInputOption: args.valueInputOption || 'USER_ENTERED',
      requestBody: {
        values: args.values,
      },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'append_sheet_values');
  }
};
