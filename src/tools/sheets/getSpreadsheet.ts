import { sheets_v4 } from 'googleapis';
import { GetSpreadsheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Gets metadata and structure of a Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for getting a spreadsheet
 * @returns A promise resolving to the MCP response content
 */
export const getSpreadsheetTool = async (sheets: sheets_v4.Sheets, args: GetSpreadsheetArgs) => {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: args.spreadsheetId,
      fields: args.fields,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'get_spreadsheet');
  }
};
