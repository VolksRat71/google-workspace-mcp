import { docs_v1 } from 'googleapis';
import { BatchUpdateDocumentArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Applies a batch of updates to a Google Document.
 * @param docs The authenticated Google Docs API client
 * @param args The arguments for updating a document
 * @returns A promise resolving to the MCP response content
 */
export const batchUpdateDocumentTool = async (docs: docs_v1.Docs, args: BatchUpdateDocumentArgs) => {
  try {
    const response = await docs.documents.batchUpdate({
      documentId: args.documentId,
      requestBody: {
        requests: args.requests,
      },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'batch_update_document');
  }
};
