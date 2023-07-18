export const Namespace = 'workflows' as const;

export const Strings = {
  'recent-workflows': 'Recent Workflows',
  'workflows-count_one': '{{count, number}} workflow',
  'workflows-count_other': '{{count, number}} workflows',
  'workflows-error-querying':
    'A error has occurred while querying for Workflows.',
  'filtered-workflows-count':
    'Results {{filtered, number}} of {{total, number}} workflows',
  terminate: 'Terminate',
  'batch-operation-modal-title': '{{action}} Workflows',
  'workflow-action-reason-placeholder': '{{action}} from the Web UI',
  'workflow-action-reason-placeholder-with-email':
    '{{action}} from the Web UI by {{email}}',
  'batch-operation-confirmation-all':
    'Are you sure you want to {{action}} all workflows matching the following query? This action cannot be undone.',
  'batch-operation-count-disclaimer':
    'Note: The actual count of workflows that will be affected is the total number of running workflows matching this query at the time of clicking "{{action}}".',
  'batch-cancel-confirmation_one':
    'Are you sure you want to cancel {{count, number}} running workflow?',
  'batch-cancel-confirmation_other':
    'Are you sure you want to cancel {{count, number}} running workflows?',
  'batch-terminate-confirmation_one':
    'Are you sure you want to terminate {{count, number}} running workflow?',
  'batch-terminate-confirmation_other':
    'Are you sure you want to terminate {{count, number}} running workflows?',
  'batch-operation-confirmation-input-hint':
    'If you supply a custom reason, "{{placeholder}}" will be appended to it.',
  'batch-terminate-all-success':
    'The batch $t(terminate) request is processing in the background.',
  'batch-cancel-all-success':
    'The batch $t(cancel) request is processing in the background.',
  'batch-terminate-success': 'Successfully $t(terminated) {{count}} workflows.',
  'batch-cancel-success': 'Successfully $t(canceled) {{count}} workflows.',
  'configure-workflows': 'Configure Workflow List',
  'configure-workflows-description':
    'Add (<1></1>), re-arrange (<2></2>), and remove (<3></3>), Workflow Headings to personalize the Workflow List Table.',
  'all-statuses': 'All Statuses',
  running: 'Running',
  'timed-out': 'Timed Out',
  completed: 'Completed',
  failed: 'Failed',
  'contd-as-new': "Cont'd as New",
  'continued-as-new': 'ContinuedAsNew',
  terminated: 'Terminated',
  canceled: 'Canceled',
  paused: 'Paused',
  reset: 'Reset',
  signal: 'Send a Signal',
  'n-selected': '{{count, number}} selected',
  'all-selected': 'All {{count, number}} selected.',
  'select-all': 'select all {{count, number}}',
  'request-cancellation': 'Request Cancellation',
  'back-to-workflows': 'Back to Workflows',
  'auto-refresh': 'Auto refresh',
  'auto-refresh-tooltip': '15 second page refresh',
  input: 'Input',
  'input-and-results': 'Input and Results',
  'continued-as-new-with-input': 'Continued as New with Input',
  results: 'Results',
  'recent-events': 'Recent Events',
  history: 'History',
  compact: 'Compact',
  json: 'JSON',
  download: 'Download',
  'reset-disabled':
    'Resetting workflows is not enabled, please contact your administrator for assistance.',
  'reset-disabled-pending-children':
    'Cannot reset workflows with pending children.',
  'reset-disabled-no-events':
    'Cannot reset workflows without WorkflowTaskStarted, WorkflowTaskCompleted, or WorkflowTaskTimedOut events.',
  'signal-disabled':
    'Signaling workflows is not enabled, please contact your administrator for assistance.',
  'terminate-disabled':
    'Terminating workflows is not enabled, please contact your adminstrator for assistance.',
  'terminate-success': 'Worklfow terminated.',
  'cancel-success': 'Workflow canceled.',
  'signal-success': 'Workflow signaled.',
  'reset-modal-title': 'Reset Workflow',
  'reset-reapply-type-label': 'Reapply Type',
  'reset-reapply-all': 'All Events',
  'reset-reapply-signals-only': 'Signals Only',
  'reset-reapply-none': 'None',
  'cancel-modal-title': 'Cancel Workflow',
  'cancel-modal-confirmation':
    'Are you sure you want to cancel this workflow? This action cannot be undone.',
  'terminate-modal-title': 'Terminate Workflow',
  'terminate-modal-confirmation':
    'Are you sure you want to terminate this workflow? This action cannot be undone.',
  'signal-modal-title': 'Send a Signal',
  'signal-name-label': 'Signal name',
  'signal-payload-input-label': 'Input',
  'signal-payload-input-label-hint': '(only JSON payloads are supported)',
  'cancel-request-sent': 'Cancel Request Sent',
  'cancel-request-sent-description':
    "The request to cancel this Workflow Execution has been sent. If the Workflow uses the cancellation API, it'll cancel at the next available opportunity.",
  'reset-success-alert-title': 'This Workflow has been reset',
  'reset-success-alert-description':
    'You can find the resulting Workflow Execution <1>here</1>.',
  'history-tab': 'History',
  'workers-tab': 'Workers',
  'pending-activities-tab': 'Pending Activities',
  'stack-trace-tab': 'Stack Trace',
  'queries-tab': 'Queries',
  'workflow-error-no-workers-title': 'No Workers Running',
  'workflow-error-no-workers-description':
    'Please make sure you have at least one worker connected to the {{taskQueue}} Task Queue.',
  'state-transitions': 'State Transitions',
  'start-and-close-time': 'Start & Close Time',
  relationships: 'Relationships',
  parents_zero: '0 Parents',
  parents_one: '1 Parent',
  'pending-children_one': '1 Pending Child',
  'pending-children_other': '{{count}} Pending Children',
  children_one: '1 Child',
  children_other: '{{count}} Children',
  first: '{{count}} First',
  previous: '{{count}} Previous',
  next: '{{count}} Next',
  'no-relationships': "This workflow doesn't have any relationships",
  'parent-id': 'Parent Workflow ID',
  'parent-run-id': 'Parent Run ID',
  'first-execution': 'First Execution',
  'previous-execution': 'Previous Execution',
  'next-execution': 'Next Execution',
  'child-id': 'Child Workflow ID',
  'child-run-id': 'Child Run ID',
  'pending-activities': 'Pending Activities',
  'pending-activities-canceled': 'Pending activities have been canceled.',
  'activity-type': 'Activity Type',
  'last-heartbeat': 'Last Heartbeat',
  attempt: 'Attempt',
  'attempts-left': 'Attempts Left',
  'next-retry': 'Next Retry',
  expiration: 'Expiration',
  'heartbeat-details': 'Heartbeat Details',
  'last-failure': 'Last Failure',
} as const;
