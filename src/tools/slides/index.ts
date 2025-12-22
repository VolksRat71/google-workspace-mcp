import { slides_v1 } from 'googleapis';
import {
  CreatePresentationArgsSchema,
  GetPresentationArgsSchema,
  BatchUpdatePresentationArgsSchema,
  GetPageArgsSchema,
  SummarizePresentationArgsSchema,
} from '../../schemas.js';
import { createPresentationTool } from './createPresentation.js';
import { getPresentationTool } from './getPresentation.js';
import { batchUpdatePresentationTool } from './batchUpdatePresentation.js';
import { getPageTool } from './getPage.js';
import { summarizePresentationTool } from './summarizePresentation.js';

export const tools = [
  {
    name: 'create_presentation',
    description: 'Create a new Google Slides presentation',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the presentation.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_presentation',
    description: 'Get details about a Google Slides presentation',
    inputSchema: {
      type: 'object',
      properties: {
        presentationId: {
          type: 'string',
          description: 'The ID of the presentation to retrieve.',
        },
        fields: {
          type: 'string',
          description: 'Optional. A mask specifying which fields to include in the response (e.g., "slides,pageSize").',
        },
      },
      required: ['presentationId'],
    },
  },
  {
    name: 'batch_update_presentation',
    description: 'Apply a batch of updates to a Google Slides presentation',
    inputSchema: {
      type: 'object',
      properties: {
        presentationId: {
          type: 'string',
          description: 'The ID of the presentation to update.',
        },
        requests: {
          type: 'array',
          description: 'A list of update requests to apply. See Google Slides API documentation for request structures.',
          items: { type: 'object' },
        },
        writeControl: {
          type: 'object',
          description: 'Optional. Provides control over how write requests are executed.',
          properties: {
            requiredRevisionId: { type: 'string' },
            targetRevisionId: { type: 'string' },
          },
        },
      },
      required: ['presentationId', 'requests'],
    },
  },
  {
    name: 'get_page',
    description: 'Get details about a specific page (slide) in a presentation',
    inputSchema: {
      type: 'object',
      properties: {
        presentationId: {
          type: 'string',
          description: 'The ID of the presentation.',
        },
        pageObjectId: {
          type: 'string',
          description: 'The object ID of the page (slide) to retrieve.',
        },
      },
      required: ['presentationId', 'pageObjectId'],
    },
  },
  {
    name: 'summarize_presentation',
    description: 'Extract text content from all slides in a presentation for summarization purposes',
    inputSchema: {
      type: 'object',
      properties: {
        presentationId: {
          type: 'string',
          description: 'The ID of the presentation to summarize.',
        },
        include_notes: {
          type: 'boolean',
          description: 'Optional. Whether to include speaker notes in the summary (default: false).',
        },
      },
      required: ['presentationId'],
    },
  },
];

export const createHandlers = (slides: slides_v1.Slides) => ({
  create_presentation: async (args: unknown) => {
    const parsedArgs = CreatePresentationArgsSchema.parse(args);
    return await createPresentationTool(slides, parsedArgs);
  },
  get_presentation: async (args: unknown) => {
    const parsedArgs = GetPresentationArgsSchema.parse(args);
    return await getPresentationTool(slides, parsedArgs);
  },
  batch_update_presentation: async (args: unknown) => {
    const parsedArgs = BatchUpdatePresentationArgsSchema.parse(args);
    return await batchUpdatePresentationTool(slides, parsedArgs);
  },
  get_page: async (args: unknown) => {
    const parsedArgs = GetPageArgsSchema.parse(args);
    return await getPageTool(slides, parsedArgs);
  },
  summarize_presentation: async (args: unknown) => {
    const parsedArgs = SummarizePresentationArgsSchema.parse(args);
    return await summarizePresentationTool(slides, parsedArgs);
  },
});
