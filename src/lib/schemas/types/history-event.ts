import { z } from 'zod';

/**
 * History events are the method by which Temporal SDKs advance (or recreate) workflow state.
 *  See the `EventType` enum for more info about what each event is for.
 */
export const HistoryEvent = z
  .object({
    /**Monotonically increasing event number, starts at 1.*/
    eventId: z
      .string()
      .describe('Monotonically increasing event number, starts at 1.')
      .optional(),
    eventTime: z.string().datetime({ offset: true }).optional(),
    eventType: z
      .enum([
        'EVENT_TYPE_UNSPECIFIED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_FAILED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT',
        'EVENT_TYPE_WORKFLOW_TASK_SCHEDULED',
        'EVENT_TYPE_WORKFLOW_TASK_STARTED',
        'EVENT_TYPE_WORKFLOW_TASK_COMPLETED',
        'EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT',
        'EVENT_TYPE_WORKFLOW_TASK_FAILED',
        'EVENT_TYPE_ACTIVITY_TASK_SCHEDULED',
        'EVENT_TYPE_ACTIVITY_TASK_STARTED',
        'EVENT_TYPE_ACTIVITY_TASK_COMPLETED',
        'EVENT_TYPE_ACTIVITY_TASK_FAILED',
        'EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT',
        'EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED',
        'EVENT_TYPE_ACTIVITY_TASK_CANCELED',
        'EVENT_TYPE_TIMER_STARTED',
        'EVENT_TYPE_TIMER_FIRED',
        'EVENT_TYPE_TIMER_CANCELED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED',
        'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED',
        'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED',
        'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED',
        'EVENT_TYPE_MARKER_RECORDED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW',
        'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED',
        'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT',
        'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED',
        'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED',
        'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED',
        'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED',
        'EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES',
        'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ADMITTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_REJECTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_COMPLETED',
        'EVENT_TYPE_WORKFLOW_PROPERTIES_MODIFIED_EXTERNALLY',
        'EVENT_TYPE_ACTIVITY_PROPERTIES_MODIFIED_EXTERNALLY',
        'EVENT_TYPE_WORKFLOW_PROPERTIES_MODIFIED',
        'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
        'EVENT_TYPE_NEXUS_OPERATION_STARTED',
        'EVENT_TYPE_NEXUS_OPERATION_COMPLETED',
        'EVENT_TYPE_NEXUS_OPERATION_FAILED',
        'EVENT_TYPE_NEXUS_OPERATION_CANCELED',
        'EVENT_TYPE_NEXUS_OPERATION_TIMED_OUT',
        'EVENT_TYPE_NEXUS_OPERATION_CANCEL_REQUESTED',
        'EVENT_TYPE_WORKFLOW_EXECUTION_OPTIONS_UPDATED',
        'EVENT_TYPE_NEXUS_OPERATION_CANCEL_REQUEST_COMPLETED',
        'EVENT_TYPE_NEXUS_OPERATION_CANCEL_REQUEST_FAILED',
      ])
      .optional(),
    /**TODO: What is this? Appears unused by SDKs*/
    version: z
      .string()
      .describe('TODO: What is this? Appears unused by SDKs')
      .optional(),
    /**TODO: What is this? Appears unused by SDKs*/
    taskId: z
      .string()
      .describe('TODO: What is this? Appears unused by SDKs')
      .optional(),
    /**
     * Set to true when the SDK may ignore the event as it does not impact workflow state or
     *  information in any way that the SDK need be concerned with. If an SDK encounters an event
     *  type which it does not understand, it must error unless this is true. If it is true, it's
     *  acceptable for the event type and/or attributes to be uninterpretable.
     */
    workerMayIgnore: z
      .boolean()
      .describe(
        "Set to true when the SDK may ignore the event as it does not impact workflow state or\n information in any way that the SDK need be concerned with. If an SDK encounters an event\n type which it does not understand, it must error unless this is true. If it is true, it's\n acceptable for the event type and/or attributes to be uninterpretable.",
      )
      .optional(),
    /**
     * Metadata on the event. This is often carried over from commands and client calls. Most events
     *  won't have this information, and how this information is used is dependent upon the interface
     *  that reads it.
     *
     *  Current well-known uses:
     *   * workflow_execution_started_event_attributes - summary and details from start workflow.
     *   * timer_started_event_attributes - summary represents an identifier for the timer for use by
     *     user interfaces.
     */
    userMetadata: z
      .any()
      .describe(
        "Metadata on the event. This is often carried over from commands and client calls. Most events\n won't have this information, and how this information is used is dependent upon the interface\n that reads it.\n\n Current well-known uses:\n  * workflow_execution_started_event_attributes - summary and details from start workflow.\n  * timer_started_event_attributes - summary represents an identifier for the timer for use by\n    user interfaces.",
      )
      .optional(),
    /**Links associated with the event.*/
    links: z
      .array(z.any())
      .describe('Links associated with the event.')
      .optional(),
    workflowExecutionStartedEventAttributes: z.any().optional(),
    workflowExecutionCompletedEventAttributes: z.any().optional(),
    workflowExecutionFailedEventAttributes: z.any().optional(),
    workflowExecutionTimedOutEventAttributes: z.any().optional(),
    workflowTaskScheduledEventAttributes: z.any().optional(),
    workflowTaskStartedEventAttributes: z.any().optional(),
    workflowTaskCompletedEventAttributes: z.any().optional(),
    workflowTaskTimedOutEventAttributes: z.any().optional(),
    workflowTaskFailedEventAttributes: z.any().optional(),
    activityTaskScheduledEventAttributes: z.any().optional(),
    activityTaskStartedEventAttributes: z.any().optional(),
    activityTaskCompletedEventAttributes: z.any().optional(),
    activityTaskFailedEventAttributes: z.any().optional(),
    activityTaskTimedOutEventAttributes: z.any().optional(),
    timerStartedEventAttributes: z.any().optional(),
    timerFiredEventAttributes: z.any().optional(),
    activityTaskCancelRequestedEventAttributes: z.any().optional(),
    activityTaskCanceledEventAttributes: z.any().optional(),
    timerCanceledEventAttributes: z.any().optional(),
    markerRecordedEventAttributes: z.any().optional(),
    workflowExecutionSignaledEventAttributes: z.any().optional(),
    workflowExecutionTerminatedEventAttributes: z.any().optional(),
    workflowExecutionCancelRequestedEventAttributes: z.any().optional(),
    workflowExecutionCanceledEventAttributes: z.any().optional(),
    requestCancelExternalWorkflowExecutionInitiatedEventAttributes: z
      .any()
      .optional(),
    requestCancelExternalWorkflowExecutionFailedEventAttributes: z
      .any()
      .optional(),
    externalWorkflowExecutionCancelRequestedEventAttributes: z.any().optional(),
    workflowExecutionContinuedAsNewEventAttributes: z.any().optional(),
    startChildWorkflowExecutionInitiatedEventAttributes: z.any().optional(),
    startChildWorkflowExecutionFailedEventAttributes: z.any().optional(),
    childWorkflowExecutionStartedEventAttributes: z.any().optional(),
    childWorkflowExecutionCompletedEventAttributes: z.any().optional(),
    childWorkflowExecutionFailedEventAttributes: z.any().optional(),
    childWorkflowExecutionCanceledEventAttributes: z.any().optional(),
    childWorkflowExecutionTimedOutEventAttributes: z.any().optional(),
    childWorkflowExecutionTerminatedEventAttributes: z.any().optional(),
    signalExternalWorkflowExecutionInitiatedEventAttributes: z.any().optional(),
    signalExternalWorkflowExecutionFailedEventAttributes: z.any().optional(),
    externalWorkflowExecutionSignaledEventAttributes: z.any().optional(),
    upsertWorkflowSearchAttributesEventAttributes: z.any().optional(),
    workflowExecutionUpdateAcceptedEventAttributes: z.any().optional(),
    workflowExecutionUpdateRejectedEventAttributes: z.any().optional(),
    workflowExecutionUpdateCompletedEventAttributes: z.any().optional(),
    workflowPropertiesModifiedExternallyEventAttributes: z.any().optional(),
    activityPropertiesModifiedExternallyEventAttributes: z.any().optional(),
    workflowPropertiesModifiedEventAttributes: z.any().optional(),
    workflowExecutionUpdateAdmittedEventAttributes: z.any().optional(),
    nexusOperationScheduledEventAttributes: z.any().optional(),
    nexusOperationStartedEventAttributes: z.any().optional(),
    nexusOperationCompletedEventAttributes: z.any().optional(),
    nexusOperationFailedEventAttributes: z.any().optional(),
    nexusOperationCanceledEventAttributes: z.any().optional(),
    nexusOperationTimedOutEventAttributes: z.any().optional(),
    nexusOperationCancelRequestedEventAttributes: z.any().optional(),
    workflowExecutionOptionsUpdatedEventAttributes: z.any().optional(),
    nexusOperationCancelRequestCompletedEventAttributes: z.any().optional(),
    nexusOperationCancelRequestFailedEventAttributes: z.any().optional(),
  })
  .describe(
    'History events are the method by which Temporal SDKs advance (or recreate) workflow state.\n See the `EventType` enum for more info about what each event is for.',
  );
export type HistoryEvent = z.infer<typeof HistoryEvent>;
