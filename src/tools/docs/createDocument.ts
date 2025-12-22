import { docs_v1 } from 'googleapis';
import { CreateDocumentArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Creates a new Google Document.
 * @param docs The authenticated Google Docs API client
 * @param args The arguments for creating a document
 * @returns A promise resolving to the MCP response content
 */
export const createDocumentTool = async (docs: docs_v1.Docs, args: CreateDocumentArgs) => {
  try {
    const response = await docs.documents.create({
      requestBody: {
        title: args.title,
      },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'create_document');
  }
};
