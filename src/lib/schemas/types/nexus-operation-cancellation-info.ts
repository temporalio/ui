import { z } from 'zod';

/**NexusOperationCancellationInfo contains the state of a nexus operation cancellation.*/
export const NexusOperationCancellationInfo = z
  .object({
    /**The time when cancellation was requested.*/
    requestedTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when cancellation was requested.')
      .optional(),
    state: z
      .enum([
        'NEXUS_OPERATION_CANCELLATION_STATE_UNSPECIFIED',
        'NEXUS_OPERATION_CANCELLATION_STATE_SCHEDULED',
        'NEXUS_OPERATION_CANCELLATION_STATE_BACKING_OFF',
        'NEXUS_OPERATION_CANCELLATION_STATE_SUCCEEDED',
        'NEXUS_OPERATION_CANCELLATION_STATE_FAILED',
        'NEXUS_OPERATION_CANCELLATION_STATE_TIMED_OUT',
        'NEXUS_OPERATION_CANCELLATION_STATE_BLOCKED',
      ])
      .optional(),
    /**
     * The number of attempts made to deliver the cancel operation request.
     *  This number represents a minimum bound since the attempt is incremented after the request completes.
     */
    attempt: z
      .number()
      .int()
      .describe(
        'The number of attempts made to deliver the cancel operation request.\n This number represents a minimum bound since the attempt is incremented after the request completes.',
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
    /**If the state is BLOCKED, blocked reason provides additional information.*/
    blockedReason: z
      .string()
      .describe(
        'If the state is BLOCKED, blocked reason provides additional information.',
      )
      .optional(),
  })
  .describe(
    'NexusOperationCancellationInfo contains the state of a nexus operation cancellation.',
  );
export type NexusOperationCancellationInfo = z.infer<
  typeof NexusOperationCancellationInfo
>;
