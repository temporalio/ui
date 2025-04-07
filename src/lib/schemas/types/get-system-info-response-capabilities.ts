import { z } from 'zod';

/**System capability details.*/
export const GetSystemInfoResponse_Capabilities = z
  .object({
    /**True if signal and query headers are supported.*/
    signalAndQueryHeader: z
      .boolean()
      .describe('True if signal and query headers are supported.')
      .optional(),
    /**
     * True if internal errors are differentiated from other types of errors for purposes of
     *  retrying non-internal errors.
     *
     *  When unset/false, clients retry all failures. When true, clients should only retry
     *  non-internal errors.
     */
    internalErrorDifferentiation: z
      .boolean()
      .describe(
        'True if internal errors are differentiated from other types of errors for purposes of\n retrying non-internal errors.\n\n When unset/false, clients retry all failures. When true, clients should only retry\n non-internal errors.',
      )
      .optional(),
    /**True if RespondActivityTaskFailed API supports including heartbeat details*/
    activityFailureIncludeHeartbeat: z
      .boolean()
      .describe(
        'True if RespondActivityTaskFailed API supports including heartbeat details',
      )
      .optional(),
    /**Supports scheduled workflow features.*/
    supportsSchedules: z
      .boolean()
      .describe('Supports scheduled workflow features.')
      .optional(),
    /**True if server uses protos that include temporal.api.failure.v1.Failure.encoded_attributes*/
    encodedFailureAttributes: z
      .boolean()
      .describe(
        'True if server uses protos that include temporal.api.failure.v1.Failure.encoded_attributes',
      )
      .optional(),
    /**
     * True if server supports dispatching Workflow and Activity tasks based on a worker's build_id
     *  (see:
     *  https://github.com/temporalio/proposals/blob/a123af3b559f43db16ea6dd31870bfb754c4dc5e/versioning/worker-versions.md)
     */
    buildIdBasedVersioning: z
      .boolean()
      .describe(
        "True if server supports dispatching Workflow and Activity tasks based on a worker's build_id\n (see:\n https://github.com/temporalio/proposals/blob/a123af3b559f43db16ea6dd31870bfb754c4dc5e/versioning/worker-versions.md)",
      )
      .optional(),
    /**True if server supports upserting workflow memo*/
    upsertMemo: z
      .boolean()
      .describe('True if server supports upserting workflow memo')
      .optional(),
    /**True if server supports eager workflow task dispatching for the StartWorkflowExecution API*/
    eagerWorkflowStart: z
      .boolean()
      .describe(
        'True if server supports eager workflow task dispatching for the StartWorkflowExecution API',
      )
      .optional(),
    /**
     * True if the server knows about the sdk metadata field on WFT completions and will record
     *  it in history
     */
    sdkMetadata: z
      .boolean()
      .describe(
        'True if the server knows about the sdk metadata field on WFT completions and will record\n it in history',
      )
      .optional(),
    /**True if the server supports count group by execution status*/
    countGroupByExecutionStatus: z
      .boolean()
      .describe('True if the server supports count group by execution status')
      .optional(),
    /**
     * True if the server supports Nexus operations.
     *  This flag is dependent both on server version and for Nexus to be enabled via server configuration.
     */
    nexus: z
      .boolean()
      .describe(
        'True if the server supports Nexus operations.\n This flag is dependent both on server version and for Nexus to be enabled via server configuration.',
      )
      .optional(),
  })
  .describe('System capability details.');
export type GetSystemInfoResponse_Capabilities = z.infer<
  typeof GetSystemInfoResponse_Capabilities
>;
