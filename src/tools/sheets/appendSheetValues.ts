import { sheets_v4 } from 'googleapis';
import { AppendSheetValuesArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Appends rows to a Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for appending sheet values
 * @returns A promise resolving to the MCP response content
 */
export const appendSheetValuesTool = async (sheets: sheets_v4.Sheets, args: AppendSheetValuesArgs) => {
  try {
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
