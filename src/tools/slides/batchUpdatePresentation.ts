import { slides_v1, drive_v3 } from 'googleapis';
import { BatchUpdatePresentationArgs } from '../../schemas.js';
import { handleGoogleApiError } from '../../utils/errorHandler.js';
import { createSnapshot } from '../../utils/snapshotManager.js';

/**
 * Applies a batch of updates to a Google Slides presentation.
 * Creates a snapshot before modifying unless skipSnapshot is true.
 * @param slides The authenticated Google Slides API client.
 * @param drive The authenticated Google Drive API client.
 * @param args The arguments for the batch update.
 * @returns A promise resolving to the MCP response content.
 * @throws McpError if the Google API call fails.
 */
export const batchUpdatePresentationTool = async (
  slides: slides_v1.Slides,
  drive: drive_v3.Drive,
  args: BatchUpdatePresentationArgs
) => {
  try {
    // Create snapshot unless opted out
    if (!args.skipSnapshot) {
      try {
        await createSnapshot(drive, args.presentationId, 'presentation', 'batch_update_presentation');
      } catch (snapshotError) {
        console.warn('Snapshot creation failed, proceeding with update:', snapshotError);
      }
    }

    const response = await slides.presentations.batchUpdate({
      presentationId: args.presentationId,
      requestBody: {
        requests: args.requests,
        writeControl: args.writeControl,
      },
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    throw handleGoogleApiError(error, 'batch_update_presentation');
  }
};
