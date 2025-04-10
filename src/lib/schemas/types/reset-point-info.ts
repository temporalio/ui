import { z } from 'zod';

/**
 * ResetPointInfo records the workflow event id that is the first one processed by a given
 *  build id or binary checksum. A new reset point will be created if either build id or binary
 *  checksum changes (although in general only one or the other will be used at a time).
 */
export const ResetPointInfo = z
  .object({
    /**Worker build id.*/
    buildId: z.string().describe('Worker build id.').optional(),
    /**A worker binary version identifier (deprecated).*/
    binaryChecksum: z
      .string()
      .describe('A worker binary version identifier (deprecated).')
      .optional(),
    /**The first run ID in the execution chain that was touched by this worker build.*/
    runId: z
      .string()
      .describe(
        'The first run ID in the execution chain that was touched by this worker build.',
      )
      .optional(),
    /**Event ID of the first WorkflowTaskCompleted event processed by this worker build.*/
    firstWorkflowTaskCompletedId: z
      .string()
      .describe(
        'Event ID of the first WorkflowTaskCompleted event processed by this worker build.',
      )
      .optional(),
    createTime: z.string().datetime({ offset: true }).optional(),
    /**
     * (-- api-linter: core::0214::resource-expiry=disabled
     *      aip.dev/not-precedent: TTL is not defined for ResetPointInfo. --)
     *  The time that the run is deleted due to retention.
     */
    expireTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        '(-- api-linter: core::0214::resource-expiry=disabled\n     aip.dev/not-precedent: TTL is not defined for ResetPointInfo. --)\n The time that the run is deleted due to retention.',
      )
      .optional(),
    /**false if the reset point has pending childWFs/reqCancels/signalExternals.*/
    resettable: z
      .boolean()
      .describe(
        'false if the reset point has pending childWFs/reqCancels/signalExternals.',
      )
      .optional(),
  })
  .describe(
    'ResetPointInfo records the workflow event id that is the first one processed by a given\n build id or binary checksum. A new reset point will be created if either build id or binary\n checksum changes (although in general only one or the other will be used at a time).',
  );
export type ResetPointInfo = z.infer<typeof ResetPointInfo>;
