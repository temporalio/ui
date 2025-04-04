import { z } from 'zod';

/**Not used anywhere. Use case is replaced by WorkflowExecutionOptionsUpdatedEventAttributes*/
export const WorkflowPropertiesModifiedExternallyEventAttributes = z
  .object({
    /**Not used.*/
    newTaskQueue: z.string().describe('Not used.').optional(),
    /**Not used.*/
    newWorkflowTaskTimeout: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe('Not used.')
      .optional(),
    /**Not used.*/
    newWorkflowRunTimeout: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe('Not used.')
      .optional(),
    /**Not used.*/
    newWorkflowExecutionTimeout: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe('Not used.')
      .optional(),
    /**Not used.*/
    upsertedMemo: z.any().describe('Not used.').optional(),
  })
  .describe(
    'Not used anywhere. Use case is replaced by WorkflowExecutionOptionsUpdatedEventAttributes',
  );
export type WorkflowPropertiesModifiedExternallyEventAttributes = z.infer<
  typeof WorkflowPropertiesModifiedExternallyEventAttributes
>;
