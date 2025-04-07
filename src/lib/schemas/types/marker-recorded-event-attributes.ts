import { z } from 'zod';

export const MarkerRecordedEventAttributes = z.object({
  /**Workers use this to identify the "types" of various markers. Ex: Local activity, side effect.*/
  markerName: z
    .string()
    .describe(
      'Workers use this to identify the "types" of various markers. Ex: Local activity, side effect.',
    )
    .optional(),
  /**Serialized information recorded in the marker*/
  details: z
    .record(z.any())
    .describe('Serialized information recorded in the marker')
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  header: z.any().optional(),
  /**Some uses of markers, like a local activity, could "fail". If they did that is recorded here.*/
  failure: z
    .any()
    .describe(
      'Some uses of markers, like a local activity, could "fail". If they did that is recorded here.',
    )
    .optional(),
});
export type MarkerRecordedEventAttributes = z.infer<
  typeof MarkerRecordedEventAttributes
>;
