import { sheets_v4 } from 'googleapis';
import { GetSheetValuesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Reads cell values from a Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for getting sheet values
 * @returns A promise resolving to the MCP response content
 */
export const getSheetValuesTool = async (sheets: sheets_v4.Sheets, args: GetSheetValuesArgs) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range: args.range,
      valueRenderOption: args.valueRenderOption || 'FORMATTED_VALUE',
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'get_sheet_values');
  }
};
