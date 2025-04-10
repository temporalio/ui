import { z } from 'zod';

/**Trigger for when the workflow is closed.*/
export const CallbackInfo_WorkflowClosed = z
  .object({})
  .describe('Trigger for when the workflow is closed.');
export type CallbackInfo_WorkflowClosed = z.infer<
  typeof CallbackInfo_WorkflowClosed
>;
