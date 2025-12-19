import { z } from 'zod';

export const CreatePresentationArgsSchema = z.object({
  title: z.string().min(1, { message: '"title" (string) is required.' }),
});
export type CreatePresentationArgs = z.infer<typeof CreatePresentationArgsSchema>;

export const GetPresentationArgsSchema = z.object({
  presentationId: z.string().min(1, { message: '"presentationId" (string) is required.' }),
  fields: z.string().optional(),
});
export type GetPresentationArgs = z.infer<typeof GetPresentationArgsSchema>;

// Using z.any() for complex Google Slides API structures for simplicity in this context.
// For stricter typing, these could be defined more precisely based on the Google Slides API.
const GoogleSlidesRequestSchema = z.any();
const GoogleSlidesWriteControlSchema = z.any();

export const BatchUpdatePresentationArgsSchema = z.object({
  presentationId: z.string().min(1, { message: '"presentationId" (string) is required.' }),
  requests: z.array(GoogleSlidesRequestSchema).min(1, { message: '"requests" (array) is required.' }),
  writeControl: GoogleSlidesWriteControlSchema.optional(),
  skipSnapshot: z.boolean().optional(),
});
export type BatchUpdatePresentationArgs = z.infer<typeof BatchUpdatePresentationArgsSchema>;

export const GetPageArgsSchema = z.object({
  presentationId: z.string().min(1, { message: '"presentationId" (string) is required.' }),
  pageObjectId: z.string().min(1, { message: '"pageObjectId" (string) is required.' }),
});
export type GetPageArgs = z.infer<typeof GetPageArgsSchema>;

export const SummarizePresentationArgsSchema = z.object({
  presentationId: z.string().min(1, { message: '"presentationId" (string) is required.' }),
  include_notes: z.boolean().optional(),
});
export type SummarizePresentationArgs = z.infer<typeof SummarizePresentationArgsSchema>;

// ===== Version Control Schemas =====

export const DocumentTypeSchema = z.enum(['presentation', 'spreadsheet']);

export const CreateSnapshotArgsSchema = z.object({
  documentId: z.string().min(1, { message: '"documentId" (string) is required.' }),
  documentType: DocumentTypeSchema,
  label: z.string().optional(),
});
export type CreateSnapshotArgs = z.infer<typeof CreateSnapshotArgsSchema>;

export const ListSnapshotsArgsSchema = z.object({
  documentId: z.string().min(1, { message: '"documentId" (string) is required.' }),
});
export type ListSnapshotsArgs = z.infer<typeof ListSnapshotsArgsSchema>;

export const RevertToSnapshotArgsSchema = z.object({
  originalDocumentId: z.string().min(1, { message: '"originalDocumentId" (string) is required.' }),
  snapshotId: z.string().min(1, { message: '"snapshotId" (string) is required.' }),
  documentType: DocumentTypeSchema,
});
export type RevertToSnapshotArgs = z.infer<typeof RevertToSnapshotArgsSchema>;

export const DeleteSnapshotArgsSchema = z.object({
  snapshotId: z.string().min(1, { message: '"snapshotId" (string) is required.' }),
});
export type DeleteSnapshotArgs = z.infer<typeof DeleteSnapshotArgsSchema>;

// ===== Google Sheets Schemas =====

const GoogleSheetsRequestSchema = z.any();

export const CreateSpreadsheetArgsSchema = z.object({
  title: z.string().min(1, { message: '"title" (string) is required.' }),
  sheets: z.array(z.string()).optional(),
});
export type CreateSpreadsheetArgs = z.infer<typeof CreateSpreadsheetArgsSchema>;

export const GetSpreadsheetArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  fields: z.string().optional(),
});
export type GetSpreadsheetArgs = z.infer<typeof GetSpreadsheetArgsSchema>;

export const GetSheetValuesArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  range: z.string().min(1, { message: '"range" (string) is required (e.g., "Sheet1!A1:B10").' }),
  valueRenderOption: z.enum(['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA']).optional(),
});
export type GetSheetValuesArgs = z.infer<typeof GetSheetValuesArgsSchema>;

export const UpdateSheetValuesArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  range: z.string().min(1, { message: '"range" (string) is required (e.g., "Sheet1!A1:B10").' }),
  values: z.array(z.array(z.any())).min(1, { message: '"values" (2D array) is required.' }),
  valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional(),
  skipSnapshot: z.boolean().optional(),
});
export type UpdateSheetValuesArgs = z.infer<typeof UpdateSheetValuesArgsSchema>;

export const BatchUpdateSpreadsheetArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  requests: z.array(GoogleSheetsRequestSchema).min(1, { message: '"requests" (array) is required.' }),
  skipSnapshot: z.boolean().optional(),
});
export type BatchUpdateSpreadsheetArgs = z.infer<typeof BatchUpdateSpreadsheetArgsSchema>;

export const AppendSheetValuesArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  range: z.string().min(1, { message: '"range" (string) is required (e.g., "Sheet1!A1").' }),
  values: z.array(z.array(z.any())).min(1, { message: '"values" (2D array) is required.' }),
  valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional(),
  skipSnapshot: z.boolean().optional(),
});
export type AppendSheetValuesArgs = z.infer<typeof AppendSheetValuesArgsSchema>;

export const SummarizeSpreadsheetArgsSchema = z.object({
  spreadsheetId: z.string().min(1, { message: '"spreadsheetId" (string) is required.' }),
  includeFormulas: z.boolean().optional(),
});
export type SummarizeSpreadsheetArgs = z.infer<typeof SummarizeSpreadsheetArgsSchema>;
