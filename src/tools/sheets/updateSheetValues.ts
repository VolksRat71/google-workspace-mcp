import { sheets_v4, drive_v3 } from 'googleapis';
import { UpdateSheetValuesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';
import { createSnapshot } from '../../utils/snapshotManager.js';

/**
 * Updates cell values in a Google Sheets spreadsheet.
 * Creates a snapshot before modifying unless skipSnapshot is true.
 * @param sheets The authenticated Google Sheets API client
 * @param drive The authenticated Google Drive API client
 * @param args The arguments for updating sheet values
 * @returns A promise resolving to the MCP response content
 */
export const updateSheetValuesTool = async (
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive,
  args: UpdateSheetValuesArgs
) => {
  try {
    // Create snapshot unless opted out
    if (!args.skipSnapshot) {
      try {
        await createSnapshot(drive, args.spreadsheetId, 'spreadsheet', 'update_sheet_values');
      } catch (snapshotError) {
        console.warn('Snapshot creation failed, proceeding with update:', snapshotError);
      }
    }

    const response = await sheets.spreadsheets.values.update({
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
    throw handleGoogleApiError(error, 'update_sheet_values');
  }
};
