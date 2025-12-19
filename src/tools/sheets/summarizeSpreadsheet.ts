import { sheets_v4 } from 'googleapis';
import { SummarizeSpreadsheetArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Extracts all data from a Google Sheets spreadsheet for summarization.
 * @param sheets The authenticated Google Sheets API client
 * @param args The arguments for summarizing a spreadsheet
 * @returns A promise resolving to the MCP response content
 */
export const summarizeSpreadsheetTool = async (sheets: sheets_v4.Sheets, args: SummarizeSpreadsheetArgs) => {
  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: args.spreadsheetId,
      includeGridData: false,
    });

    const title = spreadsheet.data.properties?.title || 'Untitled';
    const sheetsList = spreadsheet.data.sheets || [];

    // Extract data from each sheet
    const sheetsData = [];
    for (const sheet of sheetsList) {
      const sheetTitle = sheet.properties?.title || 'Untitled Sheet';
      const sheetId = sheet.properties?.sheetId;

      // Get all data from this sheet
      const valuesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: args.spreadsheetId,
        range: `'${sheetTitle}'`,
        valueRenderOption: args.includeFormulas ? 'FORMULA' : 'FORMATTED_VALUE',
      });

      sheetsData.push({
        sheetTitle,
        sheetId,
        rowCount: sheet.properties?.gridProperties?.rowCount || 0,
        columnCount: sheet.properties?.gridProperties?.columnCount || 0,
        data: valuesResponse.data.values || [],
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              title,
              spreadsheetId: args.spreadsheetId,
              sheetCount: sheetsList.length,
              sheets: sheetsData,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'summarize_spreadsheet');
  }
};
