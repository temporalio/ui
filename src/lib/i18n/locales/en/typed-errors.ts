export const Namespace = 'typed-errors';

export const Strings = {
  'link-preface': 'Learn more about ',
  'unspecified-title': 'Unspecified',
  'unspecified-description': 'The Workflow Task failed. See error for details.',
  'unhandled-command-title': 'Unhandled Command',
  'unhandled-command-description':
    'The Workflow Task failed because there are new available events since the last Workflow Task started. A retry Workflow Task has been scheduled and the Workflow will have a chance to handle those new events.',
  'bad-schedule-activity-attributes-title': 'Bad Schedule Activity Attributes',
  'bad-schedule-activity-attributes-description':
    'The Workflow Task failed because of missing or incorrect ScheduleActivity attributes.',
  'bad-request-cancel-activity-attributes-title':
    'Bad Request Cancel Activity Attributes',
  'bad-request-cancel-activity-attributes-desccription':
    'The Workflow Task failed because of bad RequestCancelActivity attributes. An Activity was scheduled to cancel, but the scheduled event id was never set.',
  'bad-start-timer-attributes-title': 'Bad Start Timer Attributes',
  'bad-start-timer-attributes-description':
    'The Workflow Task failed because the scheduled event is missing a timer id.',
  'bad-cancel-timer-attributes-title': 'Bad Cancel Timer Attributes',
  'bad-cancel-timer-attributes-description':
    'The Workflow Task failed when trying to cancel a timer due to an unset timer id.',
  'bad-record-marker-attributes-title': 'Bad Record Marker Attributes',
  'bad-record-marker-attributes-description':
    'The Workflow Task failed because of a missing or invalid Marker name.',
  'bad-complete-workflow-execution-attributes-title':
    'Bad Complete Workflow Execution Attributes',
  'bad-complete-workflow-execution-attributes-description':
    'The Workflow Task failed because of an unset attribute on CompleteWorkflowExecution.',
  'bad-fail-workflow-execution-attributes-title':
    'Bad Fail Workflow Execution Attributes',
  'bad-fail-workflow-execution-attributes-description':
    'The Workflow Task failed because of an unset FailWorkflowExecution attribute or failure.',
  'bad-cancel-workflow-execution-attributes-title':
    'Bad Cancel Workflow Execution Attributes',
  'bad-cancel-workflow-execution-attributes-description':
    'The Workflow Task failed because of an unset attribute on CancelWorkflowExecution.',
  'bad-request-cancel-external-attributes-title':
    'Bad Request Cancel External Attributes',
  'bad-request-cancel-external-attributes-description':
    'The Workflow Task failed due to an invalid attribute on a request to cancel an external Workflow. Check the Failure Message for more details.',
  'bad-continue-as-new-attributes-title': 'Bad Continue As New Attributes',
  'bad-continue-as-new-attributes-description':
    'The Workflow Task failed because it failed to validate on a ContinueAsNew attribute. Check the Failure Message for more details.',
  'start-timer-duplicate-id-title': 'Start Timer Duplicate ID',
  'start-timer-duplicate-id-description':
    'The Workflow Task failed because a timer with the given timer id has already started.',
  'reset-sticky-task-queue-title': 'Reset Sticky Task Queue',
  'reset-sticky-task-queue-description':
    'The Workflow Task failed because the Sticky Task Queue needs to be reset. The system will automatically retry.',
  'workflow-worker-unhandled-failure-title':
    'Workflow Worker Unhandled Failure',
  'workflow-worker-unhandled-failure-description':
    'The Workflow Task failed due to an unhandled failure from the Workflow code.',
  'workflow-worker-unhandled-failure-action': 'deterministic constraints',
  'workflow-worker-unhandled-failure-link':
    'https://docs.temporal.io/workflows/#deterministic-constraints',
  'workflow-task-heartbeat-error-title': 'Workflow Task Heartbeat Error',
  'workflow-task-heartbeat-error-description':
    'The Workflow Task failed to send a heartbeat while executing long-running local Activities. These local Activities will re-execute on the next Workflow Task attempt. If this error is persistent, these local Activities will run repeatedly until the Workflow times out.',
  'bad-signal-workflow-execution-attributes-title':
    'Bad Signal Workflow Execution Attributes',
  'bad-signal-workflow-execution-attributes-description':
    'The Workflow Task failed to validate attributes for SignalWorkflowExecution. Check the Failure Message for more details.',
  'bad-start-child-execution-attributes-title':
    'Bad Start Child Execution Attributes',
  'bad-start-child-execution-attributes-description':
    'The Workflow Task failed to validate attributes needed for StartChildWorkflowExecution. Check the Failure Message for more details.',
  'force-close-command-title': 'Force Close Command',
  'force-close-command-description':
    'The Workflow Task was forced to close. A retry will be scheduled if the error is recoverable.',
  'failover-close-command-title': 'Failover Close Command',
  'failover-close-command-description':
    'The Workflow Task was forced to close due to a Namespace failover. A retry will be scheduled automatically.',
  'bad-signal-input-size-title': 'Bad Signal Input Size',
  'bad-signal-input-size-description':
    'The payload has exceeded the available input size on a Signal.',
  'reset-workflow-title': 'Reset Workflow',
  'reset-workflow-description':
    'The system failed this Workflow Task. If a reset for this Workflow was requested check the progress on the new Workflow, otherwise reset this Workflow.',
  'bad-binary-title': 'Bad Binary',
  'bad-binary-description':
    'The system failed this Workflow Task because the deployment of this Worker is marked as bad binary.',
  'schedule-activity-duplicate-id-title': 'Schedule Activity Duplicate ID',
  'schedule-activity-duplicate-id-description':
    'The Workflow Task failed because the Activity ID is already in use, please check if you have specified the same Activity ID in your workflow.',
  'bad-search-attributes-title': 'Bad Search Attributes',
  'bad-search-attributes-description':
    'A Search attribute is either missing or the value exceeds the limit. This might cause Workflow tasks to continue to retry without success.',
  'bad-search-attributes-action': 'configuring search attributes',
  'bad-search-attributes-link':
    'https://docs.temporal.io/visibility#search-attribute',
  'non-deterministic-error-title': 'Non Deterministic Error',
  'non-deterministic-error-description':
    'A non-deterministic error has caused the Workflow Task to fail. This usually means the workflow code has a non-backward compatible change without a proper versioning branch.',
  'bad-modify-workflow-properties-attributes-title':
    'Bad Modify Workflow Properties Attributes',
  'bad-modify-workflow-properties-attributes-description':
    'The Workflow Task failed to validate attributes on ModifyWorkflowProperty on the upsert memo. Check the Failure Message for more details.',
  'pending-child-workflows-limit-exceeded-title':
    'Pending Child Workflows Limit Exceeded',
  'pending-child-workflows-limit-exceeded-description':
    'The capacity for pending child Workflows has been reached. The Workflow Task was failed to prevent any more child Workflows from being added.',
  'pending-activities-limit-exceeded-title':
    'Pending Activities Limit Exceeded',
  'pending-activities-limit-exceeded-description':
    'The capacity for pending Activities has been reached. The Workflow Task was failed to prevent another Activity from being created.',
  'pending-signals-limit-exceeded-title': 'Pending Signals Limit Exceeded',
  'pending-signals-limit-exceeded-description':
    'The capacity for pending Signals to be sent from this Workflow has been reached.',
  'pending-request-cancel-limit-exceeded-title':
    'Pending Request Cancel Limit Exceeded',
  'pending-request-cancel-limit-exceeded-description':
    'The capacity for pending requests to cancel other Workflows has been reached.',
  'bad-update-workflow-execution-message-title': 'Bad Update',
  'bad-update-workflow-execution-message-description':
    'A Workflow Execution tried to complete before receiving an Update.',
  'unhandled-update-title': 'Unhandled Update',
  'unhandled-update-description':
    'A Workflow Update was received by the Temporal Server while a Workflow Task was being processed on a Worker.',
} as const;
