import { sheets_v4 } from 'googleapis';
import { CreateSpreadsheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Creates a new Google Sheets spreadsheet.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for creating a spreadsheet
 * @returns A promise resolving to the MCP response content
 */
export const createSpreadsheetTool = async (sheets: sheets_v4.Sheets, args: CreateSpreadsheetArgs) => {
  try {
    const requestBody: sheets_v4.Schema$Spreadsheet = {
      properties: {
        title: args.title,
      },
    };

    // Add custom sheets if specified
    if (args.sheets && args.sheets.length > 0) {
      requestBody.sheets = args.sheets.map((sheetTitle) => ({
        properties: {
          title: sheetTitle,
        },
      }));
    }

    const response = await sheets.spreadsheets.create({
      requestBody,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'create_spreadsheet');
  }
};
