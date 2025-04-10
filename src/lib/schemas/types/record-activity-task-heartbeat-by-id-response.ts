import { z } from 'zod';

export const RecordActivityTaskHeartbeatByIdResponse = z.object({
  /**
   * Will be set to true if the activity has been asked to cancel itself. The SDK should then
   *  notify the activity of cancellation if it is still running.
   */
  cancelRequested: z
    .boolean()
    .describe(
      'Will be set to true if the activity has been asked to cancel itself. The SDK should then\n notify the activity of cancellation if it is still running.',
    )
    .optional(),
  /**Will be set to true if the activity is paused.*/
  activityPaused: z
    .boolean()
    .describe('Will be set to true if the activity is paused.')
    .optional(),
});
export type RecordActivityTaskHeartbeatByIdResponse = z.infer<
  typeof RecordActivityTaskHeartbeatByIdResponse
>;
