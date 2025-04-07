import { z } from 'zod';

export const PollWorkflowTaskQueueResponse = z.object({
  /**A unique identifier for this task*/
  taskToken: z
    .string()
    .describe('A unique identifier for this task')
    .optional(),
  workflowExecution: z.any().optional(),
  workflowType: z.any().optional(),
  /**
   * The last workflow task started event which was processed by some worker for this execution.
   *  Will be zero if no task has ever started.
   */
  previousStartedEventId: z
    .string()
    .describe(
      'The last workflow task started event which was processed by some worker for this execution.\n Will be zero if no task has ever started.',
    )
    .optional(),
  /**
   * The id of the most recent workflow task started event, which will have been generated as a
   *  result of this poll request being served. Will be zero if the task
   *  does not contain any events which would advance history (no new WFT started).
   *  Currently this can happen for queries.
   */
  startedEventId: z
    .string()
    .describe(
      'The id of the most recent workflow task started event, which will have been generated as a\n result of this poll request being served. Will be zero if the task\n does not contain any events which would advance history (no new WFT started).\n Currently this can happen for queries.',
    )
    .optional(),
  /**Starting at 1, the number of attempts to complete this task by any worker.*/
  attempt: z
    .number()
    .int()
    .describe(
      'Starting at 1, the number of attempts to complete this task by any worker.',
    )
    .optional(),
  /**
   * A hint that there are more tasks already present in this task queue
   *  partition. Can be used to prioritize draining a sticky queue.
   *
   *  Specifically, the returned number is the number of tasks remaining in
   *  the in-memory buffer for this partition, which is currently capped at
   *  1000. Because sticky queues only have one partition, this number is
   *  more useful when draining them. Normal queues, typically having more than one
   *  partition, will return a number representing only some portion of the
   *  overall backlog. Subsequent RPCs may not hit the same partition as
   *  this call.
   */
  backlogCountHint: z
    .string()
    .describe(
      'A hint that there are more tasks already present in this task queue\n partition. Can be used to prioritize draining a sticky queue.\n\n Specifically, the returned number is the number of tasks remaining in\n the in-memory buffer for this partition, which is currently capped at\n 1000. Because sticky queues only have one partition, this number is\n more useful when draining them. Normal queues, typically having more than one\n partition, will return a number representing only some portion of the\n overall backlog. Subsequent RPCs may not hit the same partition as\n this call.',
    )
    .optional(),
  /**
   * The history for this workflow, which will either be complete or partial. Partial histories
   *  are sent to workers who have signaled that they are using a sticky queue when completing
   *  a workflow task.
   */
  history: z
    .any()
    .describe(
      'The history for this workflow, which will either be complete or partial. Partial histories\n are sent to workers who have signaled that they are using a sticky queue when completing\n a workflow task.',
    )
    .optional(),
  /**
   * Will be set if there are more history events than were included in this response. Such events
   *  should be fetched via `GetWorkflowExecutionHistory`.
   */
  nextPageToken: z
    .string()
    .describe(
      'Will be set if there are more history events than were included in this response. Such events\n should be fetched via `GetWorkflowExecutionHistory`.',
    )
    .optional(),
  /**
   * Legacy queries appear in this field. The query must be responded to via
   *  `RespondQueryTaskCompleted`. If the workflow is already closed (queries are permitted on
   *  closed workflows) then the `history` field will be populated with the entire history. It
   *  may also be populated if this task originates on a non-sticky queue.
   */
  query: z
    .any()
    .describe(
      'Legacy queries appear in this field. The query must be responded to via\n `RespondQueryTaskCompleted`. If the workflow is already closed (queries are permitted on\n closed workflows) then the `history` field will be populated with the entire history. It\n may also be populated if this task originates on a non-sticky queue.',
    )
    .optional(),
  /**
   * The task queue this task originated from, which will always be the original non-sticky name
   *  for the queue, even if this response came from polling a sticky queue.
   */
  workflowExecutionTaskQueue: z
    .any()
    .describe(
      'The task queue this task originated from, which will always be the original non-sticky name\n for the queue, even if this response came from polling a sticky queue.',
    )
    .optional(),
  /**When this task was scheduled by the server*/
  scheduledTime: z
    .string()
    .datetime({ offset: true })
    .describe('When this task was scheduled by the server')
    .optional(),
  /**When the current workflow task started event was generated, meaning the current attempt.*/
  startedTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'When the current workflow task started event was generated, meaning the current attempt.',
    )
    .optional(),
  /**
   * Queries that should be executed after applying the history in this task. Responses should be
   *  attached to `RespondWorkflowTaskCompletedRequest::query_results`
   */
  queries: z
    .record(z.any())
    .describe(
      'Queries that should be executed after applying the history in this task. Responses should be\n attached to `RespondWorkflowTaskCompletedRequest::query_results`',
    )
    .optional(),
  /**Protocol messages piggybacking on a WFT as a transport*/
  messages: z
    .array(z.any())
    .describe('Protocol messages piggybacking on a WFT as a transport')
    .optional(),
  /**Server-advised information the SDK may use to adjust its poller count.*/
  pollerScalingDecision: z
    .any()
    .describe(
      'Server-advised information the SDK may use to adjust its poller count.',
    )
    .optional(),
});
export type PollWorkflowTaskQueueResponse = z.infer<
  typeof PollWorkflowTaskQueueResponse
>;
