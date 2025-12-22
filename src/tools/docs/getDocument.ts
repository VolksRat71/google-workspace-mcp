import { docs_v1 } from 'googleapis';
import { GetDocumentArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Gets details about a Google Document.
 * @param docs The authenticated Google Docs API client
 * @param args The arguments for getting a document
 * @returns A promise resolving to the MCP response content
 */
export const getDocumentTool = async (docs: docs_v1.Docs, args: GetDocumentArgs) => {
  try {
    const response = await docs.documents.get({
      documentId: args.documentId,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'get_document');
  }
};
