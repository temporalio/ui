import { z } from 'zod';

export const WorkflowExecutionCancelRequestedEventAttributes = z.object({
  /**
   * User provided reason for requesting cancellation
   *  TODO: shall we create a new field with name "reason" and deprecate this one?
   */
  cause: z
    .string()
    .describe(
      'User provided reason for requesting cancellation\n TODO: shall we create a new field with name "reason" and deprecate this one?',
    )
    .optional(),
  /**TODO: Is this the ID of the event in the workflow which initiated this cancel, if there was one?*/
  externalInitiatedEventId: z
    .string()
    .describe(
      'TODO: Is this the ID of the event in the workflow which initiated this cancel, if there was one?',
    )
    .optional(),
  externalWorkflowExecution: z.any().optional(),
  /**id of the worker or client who requested this cancel*/
  identity: z
    .string()
    .describe('id of the worker or client who requested this cancel')
    .optional(),
});
export type WorkflowExecutionCancelRequestedEventAttributes = z.infer<
  typeof WorkflowExecutionCancelRequestedEventAttributes
>;
