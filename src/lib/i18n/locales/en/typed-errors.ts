export const Namespace = 'typed-errors';

export const Strings = {
  'link-preface': 'Learn more about ',
  Unspecified: {
    title: 'Unspecified',
    description: 'The Workflow Task failed. See error for details.',
  },
  UnhandledCommand: {
    title: 'Unhandled Command',
    description:
      'The Workflow Task failed because there are new available events since the last Workflow Task started. A retry Workflow Task has been scheduled and the Workflow will have a chance to handle those new events.',
  },
  BadScheduleActivityAttributes: {
    title: 'Bad Schedule Activity Attributes',
    description:
      'The Workflow Task failed because of missing or incorrect ScheduleActivity attributes.',
  },
  BadRequestCancelActivityAttributes: {
    title: 'Bad Request Cancel Activity Attributes',
    description:
      'The Workflow Task failed because of bad RequestCancelActivity attributes. An Activity was scheduled to cancel, but the scheduled event id was never set.',
  },
  BadStartTimerAttributes: {
    title: 'Bad Start Timer Attributes',
    description:
      'The Workflow Task failed because the scheduled event is missing a timer id.',
  },
  BadCancelTimerAttributes: {
    title: 'Bad Cancel Timer Attributes',
    description:
      'The Workflow Task failed when trying to cancel a timer due to an unset timer id.',
  },
  BadRecordMarkerAttributes: {
    title: 'Bad Record Marker Attributes',
    description:
      'The Workflow Task failed because of a missing or invalid Marker name.',
  },
  BadCompleteWorkflowExecutionAttributes: {
    title: 'Bad Complete Workflow Execution Attributes',
    description:
      'The Workflow Task failed because of an unset attribute on CompleteWorkflowExecution.',
  },
  BadFailWorkflowExecutionAttributes: {
    title: 'Bad Fail Workflow Execution Attributes',
    description:
      'The Workflow Task failed because of an unset FailWorkflowExecution attribute or failure.',
  },
  BadCancelWorkflowExecutionAttributes: {
    title: 'Bad Cancel Workflow Execution Attributes',
    description:
      'The Workflow Task failed because of an unset attribute on CancelWorkflowExecution.',
  },
  BadRequestCancelExternalAttributes: {
    title: 'Bad Request Cancel External Attributes',
    description:
      'The Workflow Task failed due to an invalid attribute on a request to cancel an external Workflow. Check the Failure Message for more details.',
  },
  BadContinueAsNewAttributes: {
    title: 'Bad Continue As New Attributes',
    description:
      'The Workflow Task failed because it failed to validate on a ContinueAsNew attribute. Check the Failure Message for more details.',
  },
  StartTimerDuplicateId: {
    title: 'Start Timer Duplicate ID',
    description:
      'The Workflow Task failed because a timer with the given timer id has already started.',
  },
  ResetStickyTaskQueue: {
    title: 'Reset Sticky Task Queue',
    description:
      'The Workflow Task failed because the Sticky Task Queue needs to be reset. The system will automatically retry.',
  },
  WorkflowWorkerUnhandledFailure: {
    title: 'Workflow Worker Unhandled Failure',
    description:
      'The Workflow Task failed due to an unhandled failure from the Workflow code.',
  },
  WorkflowTaskHeartbeatError: {
    title: 'Workflow Task Heartbeat Error',
    description:
      'The Workflow Task failed to send a heartbeat while executing long-running local Activities. These local Activities will re-execute on the next Workflow Task attempt. If this error is persistent, these local Activities will run repeatedly until the Workflow times out.',
  },
  BadSignalWorkflowExecutionAttributes: {
    title: 'Bad Signal Workflow Execution Attributes',
    description:
      'The Workflow Task failed to validate attributes for SignalWorkflowExecution. Check the Failure Message for more details.',
  },
  BadStartChildExecutionAttributes: {
    title: 'Bad Start Child Execution Attributes',
    description:
      'The Workflow Task failed to validate attributes needed for StartChildWorkflowExecution. Check the Failure Message for more details.',
  },
  ForceCloseCommand: {
    title: 'Force Close Command',
    description:
      'The Workflow Task was forced to close. A retry will be scheduled if the error is recoverable.',
  },
  FailoverCloseCommand: {
    title: 'Failover Close Command',
    description:
      'The Workflow Task was forced to close due to a Namespace failover. A retry will be scheduled automatically.',
  },
  BadSignalInputSize: {
    title: 'Bad Signal Input Size',
    description:
      'The payload has exceeded the available input size on a Signal.',
  },
  BadBinary: {
    title: 'Bad Binary',
    description:
      'The system failed this Workflow Task because the deployment of this Worker is marked as bad binary.',
  },
  ScheduleActivityDuplicateId: {
    title: 'Schedule Activity Duplicate ID',
    description:
      'The Workflow Task failed because the Activity ID is already in use, please check if you have specified the same Activity ID in your workflow.',
  },
  BadSearchAttributes: {
    title: 'Bad Search Attributes',
    description:
      'A Search attribute is either missing or the value exceeds the limit. This might cause Workflow tasks to continue to retry without success.',
    action: 'configuring search attributes',
    link: 'https://docs.temporal.io/visibility#search-attribute',
  },
  NonDeterministicError: {
    title: 'Non Deterministic Error',
    description:
      'A non-deterministic error has caused the Workflow Task to fail. This usually means the workflow code has a non-backward compatible change without a proper versioning branch.',
    action: 'deterministic constraints',
    link: 'https://docs.temporal.io/workflows/#deterministic-constraints',
  },
  BadModifyWorkflowPropertiesAttributes: {
    title: 'Bad Modify Workflow Properties Attributes',
    description:
      'The Workflow Task failed to validate attributes on ModifyWorkflowProperty on the upsert memo. Check the Failure Message for more details.',
  },
  PendingChildWorkflowsLimitExceeded: {
    title: 'Pending Child Workflows Limit Exceeded',
    description:
      'The capacity for pending child Workflows has been reached. The Workflow Task was failed to prevent any more child Workflows from being added.',
  },
  PendingActivitiesLimitExceeded: {
    title: 'Pending Activities Limit Exceeded',
    description:
      'The capacity for pending Activities has been reached. The Workflow Task was failed to prevent another Activity from being created.',
  },
  PendingSignalsLimitExceeded: {
    title: 'Pending Signals Limit Exceeded',
    description:
      'The capacity for pending Signals to be sent from this Workflow has been reached.',
  },
  PendingRequestCancelLimitExceeded: {
    title: 'Pending Request Cancel Limit Exceeded',
    description:
      'The capacity for pending requests to cancel other Workflows has been reached.',
  },
  BadUpdateWorkflowExecutionMessage: {
    title: 'Bad Update',
    description:
      'A Workflow Execution tried to complete before receiving an Update.',
  },
  UnhandledUpdate: {
    title: 'Unhandled Update',
    description:
      'A Workflow Update was received by the Temporal Server while a Workflow Task was being processed on a Worker.',
  },
  BadScheduleNexusOperationAttributes: {
    title: 'Bad Schedule Nexus Operation Attributes',
    description:
      'A workflow task completed with an invalid ScheduleNexusOperation command.',
  },
  PendingNexusOperationsLimitExceeded: {
    title: 'Pending Nexus Operations Limit Exceeded',
    description:
      'A workflow task completed requesting to schedule a Nexus Operation exceeding the server configured limit.',
  },
  BadRequestCancelNexusOperationAttributes: {
    title: 'Bad Request Cancel Nexus Operation Attributes',
    description:
      'A workflow task completed with an invalid RequestCancelNexusOperation command.',
  },
  FeatureDisabled: {
    title: 'Feature Disabled',
    description:
      "A workflow task completed requesting a feature that's disabled on the server (either system wide or - typically - for the workflow's namespace). Check the workflow task failure message for more information.",
  },
  GrpcMessageTooLarge: {
    title: 'gRPC Message Too Large',
    description:
      'A Workflow Task failed because the gRPC message exceeded the maximum allowed size.',
  },
} as const;
