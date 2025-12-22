import { sheets_v4 } from 'googleapis';
import { CopySheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Copies a sheet from one spreadsheet to another, preserving all formatting and styles.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for copying the sheet
 * @returns A promise resolving to the MCP response content
 */
export const copySheetTool = async (sheets: sheets_v4.Sheets, args: CopySheetArgs) => {
  try {
    const response = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: args.sourceSpreadsheetId,
      sheetId: args.sourceSheetId,
      requestBody: {
        destinationSpreadsheetId: args.destinationSpreadsheetId,
      },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'copy_sheet');
  }
};
