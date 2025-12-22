import { docs_v1 } from 'googleapis';
import { SummarizeDocumentArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';

/**
 * Extracts text from structural elements recursively.
 */
const extractTextFromElements = (elements: docs_v1.Schema$StructuralElement[] | undefined): string => {
  if (!elements) return '';

  return elements
    .map((element) => {
      if (element.paragraph?.elements) {
        return element.paragraph.elements.map((e) => e.textRun?.content || '').join('');
      }
      if (element.table?.tableRows) {
        return element.table.tableRows
          .map((row) => row.tableCells?.map((cell) => extractTextFromElements(cell.content)).join('\t'))
          .join('\n');
      }
      if (element.tableOfContents?.content) {
        return extractTextFromElements(element.tableOfContents.content);
      }
      return '';
    })
    .join('');
};

/**
 * Extracts text content from a Google Document for summarization.
 * @param docs The authenticated Google Docs API client
 * @param args The arguments for summarizing a document
 * @returns A promise resolving to the MCP response content
 */
export const summarizeDocumentTool = async (docs: docs_v1.Docs, args: SummarizeDocumentArgs) => {
  try {
    const response = await docs.documents.get({
      documentId: args.documentId,
    });

    const document = response.data;
    const bodyContent = extractTextFromElements(document.body?.content);

    // Extract headers and footers if present
    const headers = document.headers
      ? Object.values(document.headers)
          .map((header) => extractTextFromElements(header.content))
          .filter(Boolean)
      : [];
    const footers = document.footers
      ? Object.values(document.footers)
          .map((footer) => extractTextFromElements(footer.content))
          .filter(Boolean)
      : [];

    const summary = {
      title: document.title || 'Untitled Document',
      documentId: document.documentId,
      revisionId: document.revisionId,
      content: bodyContent.trim(),
      ...(headers.length > 0 ? { headers } : {}),
      ...(footers.length > 0 ? { footers } : {}),
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'summarize_document');
  }
};
