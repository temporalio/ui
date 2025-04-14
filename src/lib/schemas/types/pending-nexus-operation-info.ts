import { z } from 'zod';

/**PendingNexusOperationInfo contains the state of a pending Nexus operation.*/
export const PendingNexusOperationInfo = z
  .object({
    /**
     * Endpoint name.
     *  Resolved to a URL via the cluster's endpoint registry.
     */
    endpoint: z
      .string()
      .describe(
        "Endpoint name.\n Resolved to a URL via the cluster's endpoint registry.",
      )
      .optional(),
    /**Service name.*/
    service: z.string().describe('Service name.').optional(),
    /**Operation name.*/
    operation: z.string().describe('Operation name.').optional(),
    /**
     * Operation ID. Only set for asynchronous operations after a successful StartOperation call.
     *
     *  Deprecated: Renamed to operation_token.
     */
    operationId: z
      .string()
      .describe(
        'Operation ID. Only set for asynchronous operations after a successful StartOperation call.\n\n Deprecated: Renamed to operation_token.',
      )
      .optional(),
    /**
     * Schedule-to-close timeout for this operation.
     *  This is the only timeout settable by a workflow.
     *  (-- api-linter: core::0140::prepositions=disabled
     *      aip.dev/not-precedent: "to" is used to indicate interval. --)
     */
    scheduleToCloseTimeout: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'Schedule-to-close timeout for this operation.\n This is the only timeout settable by a workflow.\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
      )
      .optional(),
    /**The time when the operation was scheduled.*/
    scheduledTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the operation was scheduled.')
      .optional(),
    state: z
      .enum([
        'PENDING_NEXUS_OPERATION_STATE_UNSPECIFIED',
        'PENDING_NEXUS_OPERATION_STATE_SCHEDULED',
        'PENDING_NEXUS_OPERATION_STATE_BACKING_OFF',
        'PENDING_NEXUS_OPERATION_STATE_STARTED',
        'PENDING_NEXUS_OPERATION_STATE_BLOCKED',
      ])
      .optional(),
    /**
     * The number of attempts made to deliver the start operation request.
     *  This number represents a minimum bound since the attempt is incremented after the request completes.
     */
    attempt: z
      .number()
      .int()
      .describe(
        'The number of attempts made to deliver the start operation request.\n This number represents a minimum bound since the attempt is incremented after the request completes.',
      )
      .optional(),
    /**The time when the last attempt completed.*/
    lastAttemptCompleteTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the last attempt completed.')
      .optional(),
    /**The last attempt's failure, if any.*/
    lastAttemptFailure: z
      .any()
      .describe("The last attempt's failure, if any.")
      .optional(),
    /**The time when the next attempt is scheduled.*/
    nextAttemptScheduleTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the next attempt is scheduled.')
      .optional(),
    cancellationInfo: z.any().optional(),
    /**
     * The event ID of the NexusOperationScheduled event. Can be used to correlate an operation in the
     *  DescribeWorkflowExecution response with workflow history.
     */
    scheduledEventId: z
      .string()
      .describe(
        'The event ID of the NexusOperationScheduled event. Can be used to correlate an operation in the\n DescribeWorkflowExecution response with workflow history.',
      )
      .optional(),
    /**If the state is BLOCKED, blocked reason provides additional information.*/
    blockedReason: z
      .string()
      .describe(
        'If the state is BLOCKED, blocked reason provides additional information.',
      )
      .optional(),
    /**Operation token. Only set for asynchronous operations after a successful StartOperation call.*/
    operationToken: z
      .string()
      .describe(
        'Operation token. Only set for asynchronous operations after a successful StartOperation call.',
      )
      .optional(),
  })
  .describe(
    'PendingNexusOperationInfo contains the state of a pending Nexus operation.',
  );
export type PendingNexusOperationInfo = z.infer<
  typeof PendingNexusOperationInfo
>;
