import { sheets_v4 } from 'googleapis';
import { BatchUpdateSpreadsheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Applies batch formatting and structural changes to a Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for batch updating a spreadsheet
 * @returns A promise resolving to the MCP response content
 */
export const batchUpdateSpreadsheetTool = async (
  sheets: sheets_v4.Sheets,
  args: BatchUpdateSpreadsheetArgs
) => {
  try {
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
