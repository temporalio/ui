import { z } from 'zod';

export const GetWorkflowExecutionHistoryResponse = z.object({
  history: z.any().optional(),
  /**
   * Raw history is an alternate representation of history that may be returned if configured on
   *  the frontend. This is not supported by all SDKs. Either this or `history` will be set.
   */
  rawHistory: z
    .array(z.any())
    .describe(
      'Raw history is an alternate representation of history that may be returned if configured on\n the frontend. This is not supported by all SDKs. Either this or `history` will be set.',
    )
    .optional(),
  /**Will be set if there are more history events than were included in this response*/
  nextPageToken: z
    .string()
    .describe(
      'Will be set if there are more history events than were included in this response',
    )
    .optional(),
  archived: z.boolean().optional(),
});
export type GetWorkflowExecutionHistoryResponse = z.infer<
  typeof GetWorkflowExecutionHistoryResponse
>;
