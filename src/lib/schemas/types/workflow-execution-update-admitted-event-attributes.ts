import { z } from 'zod';

export const WorkflowExecutionUpdateAdmittedEventAttributes = z.object({
  /**The update request associated with this event.*/
  request: z
    .any()
    .describe('The update request associated with this event.')
    .optional(),
  /**An explanation of why this event was written to history.*/
  origin: z
    .enum([
      'UPDATE_ADMITTED_EVENT_ORIGIN_UNSPECIFIED',
      'UPDATE_ADMITTED_EVENT_ORIGIN_REAPPLY',
    ])
    .describe('An explanation of why this event was written to history.')
    .optional(),
});
export type WorkflowExecutionUpdateAdmittedEventAttributes = z.infer<
  typeof WorkflowExecutionUpdateAdmittedEventAttributes
>;
