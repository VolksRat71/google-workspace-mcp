import { describe, it, expect } from 'vitest';
import {
  CreatePresentationArgsSchema,
  GetPresentationArgsSchema,
  CreateSpreadsheetArgsSchema,
  GetSheetValuesArgsSchema,
  CreateDocumentArgsSchema,
  CreateFolderArgsSchema,
  ListRevisionsArgsSchema,
  GetRevisionArgsSchema,
  CopySheetArgsSchema,
} from './schemas.js';

describe('Slides Schemas', () => {
  describe('CreatePresentationArgsSchema', () => {
    it('accepts valid input', () => {
      const result = CreatePresentationArgsSchema.safeParse({ title: 'My Presentation' });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = CreatePresentationArgsSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('rejects missing title', () => {
      const result = CreatePresentationArgsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('GetPresentationArgsSchema', () => {
    it('accepts valid input with presentationId only', () => {
      const result = GetPresentationArgsSchema.safeParse({ presentationId: 'abc123' });
      expect(result.success).toBe(true);
    });

    it('accepts optional fields parameter', () => {
      const result = GetPresentationArgsSchema.safeParse({
        presentationId: 'abc123',
        fields: 'slides,pageSize',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing presentationId', () => {
      const result = GetPresentationArgsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe('Sheets Schemas', () => {
  describe('CreateSpreadsheetArgsSchema', () => {
    it('accepts valid input', () => {
      const result = CreateSpreadsheetArgsSchema.safeParse({ title: 'My Spreadsheet' });
      expect(result.success).toBe(true);
    });

    it('accepts optional sheets array', () => {
      const result = CreateSpreadsheetArgsSchema.safeParse({
        title: 'My Spreadsheet',
        sheets: ['Sheet1', 'Sheet2'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = CreateSpreadsheetArgsSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('GetSheetValuesArgsSchema', () => {
    it('accepts valid input', () => {
      const result = GetSheetValuesArgsSchema.safeParse({
        spreadsheetId: 'abc123',
        range: 'Sheet1!A1:B10',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional valueRenderOption', () => {
      const result = GetSheetValuesArgsSchema.safeParse({
        spreadsheetId: 'abc123',
        range: 'Sheet1!A1:B10',
        valueRenderOption: 'FORMULA',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid valueRenderOption', () => {
      const result = GetSheetValuesArgsSchema.safeParse({
        spreadsheetId: 'abc123',
        range: 'Sheet1!A1:B10',
        valueRenderOption: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing range', () => {
      const result = GetSheetValuesArgsSchema.safeParse({
        spreadsheetId: 'abc123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CopySheetArgsSchema', () => {
    it('accepts valid input', () => {
      const result = CopySheetArgsSchema.safeParse({
        sourceSpreadsheetId: 'source123',
        sourceSheetId: 12345,
        destinationSpreadsheetId: 'dest456',
      });
      expect(result.success).toBe(true);
    });

    it('rejects string sheetId', () => {
      const result = CopySheetArgsSchema.safeParse({
        sourceSpreadsheetId: 'source123',
        sourceSheetId: '12345',
        destinationSpreadsheetId: 'dest456',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Docs Schemas', () => {
  describe('CreateDocumentArgsSchema', () => {
    it('accepts valid input', () => {
      const result = CreateDocumentArgsSchema.safeParse({ title: 'My Document' });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = CreateDocumentArgsSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Drive Schemas', () => {
  describe('CreateFolderArgsSchema', () => {
    it('accepts valid input with name only', () => {
      const result = CreateFolderArgsSchema.safeParse({ name: 'My Folder' });
      expect(result.success).toBe(true);
    });

    it('accepts optional parentFolderId', () => {
      const result = CreateFolderArgsSchema.safeParse({
        name: 'My Folder',
        parentFolderId: 'parent123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = CreateFolderArgsSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Revisions Schemas', () => {
  describe('ListRevisionsArgsSchema', () => {
    it('accepts valid input', () => {
      const result = ListRevisionsArgsSchema.safeParse({ documentId: 'doc123' });
      expect(result.success).toBe(true);
    });

    it('rejects empty documentId', () => {
      const result = ListRevisionsArgsSchema.safeParse({ documentId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('GetRevisionArgsSchema', () => {
    it('accepts valid input', () => {
      const result = GetRevisionArgsSchema.safeParse({
        documentId: 'doc123',
        revisionId: 'rev456',
        documentType: 'spreadsheet',
      });
      expect(result.success).toBe(true);
    });

    it('accepts all document types', () => {
      for (const docType of ['presentation', 'spreadsheet', 'document']) {
        const result = GetRevisionArgsSchema.safeParse({
          documentId: 'doc123',
          revisionId: 'rev456',
          documentType: docType,
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid documentType', () => {
      const result = GetRevisionArgsSchema.safeParse({
        documentId: 'doc123',
        revisionId: 'rev456',
        documentType: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
