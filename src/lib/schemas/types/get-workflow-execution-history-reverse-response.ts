import { z } from 'zod';

export const GetWorkflowExecutionHistoryReverseResponse = z.object({
  history: z.any().optional(),
  /**Will be set if there are more history events than were included in this response*/
  nextPageToken: z
    .string()
    .describe(
      'Will be set if there are more history events than were included in this response',
    )
    .optional(),
});
export type GetWorkflowExecutionHistoryReverseResponse = z.infer<
  typeof GetWorkflowExecutionHistoryReverseResponse
>;
