import { sheets_v4 } from 'googleapis';
import { UpdateSheetValuesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Updates cell values in a Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for updating sheet values
 * @returns A promise resolving to the MCP response content
 */
export const updateSheetValuesTool = async (
  sheets: sheets_v4.Sheets,
  args: UpdateSheetValuesArgs
) => {
  try {
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
