export const Namespace = 'schedules' as const;

export const Strings = {
  edit: 'Edit Schedule',
  create: 'Create Schedule',
  editing: 'Editing Schedule...',
  creating: 'Creating Schedule...',
  'back-to-schedule': 'Back to Schedule',
  'back-to-schedules': 'Back to Schedules',
  id: 'Schedule ID',
  schedule: 'Schedule',
  frequency: 'Frequency',
  'schedule-spec': 'Schedule Spec',
  'schedule-input': 'Schedule Input',
  'empty-state-title': 'No Schedules Found',
  'empty-state-description':
    'Try adjusting or clearing the filters to see the Schedules running on this Namespace.',
  'error-message-fetching': 'Error fetching schedules',
  'recent-runs': 'Recent Runs',
  'recent-runs-empty-state-title': 'No Recent Runs',
  'upcoming-runs': 'Upcoming Runs',
  'upcoming-runs-empty-state-title': 'No Upcoming Runs',
  loading: 'Loading Schedule...',
  deleting: 'Deleting Schedule...',
  'delete-schedule-error': 'Cannot delete schedule. {{error}}',
  pause: 'Pause',
  unpause: 'Unpause',
  'schedule-actions': 'Schedule Actions',
  'pause-modal-title': 'Pause Schedule?',
  'pause-modal-confirmation': 'Are you sure you want to pause {{schedule}}?',
  'pause-reason': 'Enter a reason for pausing the schedule.',
  'unpause-modal-title': 'Unpause Schedule?',
  'unpause-modal-confirmation':
    'Are you sure you want to unpause {{schedule}}?',
  'unpause-reason': 'Enter a reason for unpausing the schedule.',
  trigger: 'Trigger',
  backfill: 'Backfill',
  'more-options': 'More options',
  'trigger-modal-title': 'Trigger Immediately',
  'trigger-unspecified-title': 'Use Policy',
  'trigger-unspecified-description': "Use the Schedule's overlap policy.",
  'trigger-skip-title': 'Skip',
  'trigger-skip-description':
    'When the workflow completes, the next occurrence that is scheduled after that time is considered.',
  'trigger-buffer-one-title': 'Buffer One',
  'trigger-buffer-one-description':
    'Start the workflow again as soon as the current workflow completes, but buffer only one start. If another start is scheduled to happen while the workflow is running, and a workflow is already buffered, only the first workflow starts after the running workflow completes.',
  'trigger-buffer-all-title': 'Buffer All',
  'trigger-buffer-all-description':
    'Buffer any number of workflow starts to happen sequentially, beginning immediately after the running workflow completes.',
  'trigger-cancel-other-title': 'Cancel Other',
  'trigger-cancel-other-description':
    'If another workflow is running, cancel it. After the previous workflow completes cancellation, start the new workflow.',
  'trigger-terminate-other-title': 'Terminate Other',
  'trigger-terminate-other-description':
    'If another workflow is running, terminate it and start the new workflow immediately.',
  'trigger-allow-all-title': 'Allow All',
  'trigger-allow-all-description':
    "Start any number of concurrent workflows. Last completion result and last failure aren't available because the workflows aren't sequential.",
  'delete-modal-title': 'Delete Schedule?',
  'delete-modal-confirmation': 'Are you sure you want to delete {{schedule}}?',
  'advanced-settings': 'Advanced Settings ',
  'start-time': 'Schedule Start Time',
  'end-time': 'Schedule End Time',
  jitter: 'Jitter',
  'exclusion-calendar': 'Exclusion Calendar',
  'remaining-actions': 'Remaining Actions',
  'overlap-policy': 'Overlap Policy',
  'recurring-dates-heading': 'Recurring date(s)',
  'recurring-dates-description':
    'Select the specific dates for the schedule to always run on.',
  'recurring-days-heading': 'Recurring day(s)',
  'recurring-days-description':
    'Select the day(s) of the week this schedule will always run on.',
  'time-view-heading': 'Time',
  'time-view-description':
    'Specify the time (UTC) for this schedule to run. By default, the schedule will run at 00:00 UTC if left blank.',
  'interval-view-heading': 'Recurring Time',
  'interval-view-description':
    'Specify the time interval for this schedule to run (for example every 5 minutes).',
  'offset-heading': 'Offset',
  'offset-unit': 'Offset Unit',
  'offset-description':
    'Specify the time to offset when this schedule will run (for example 15 min past the hour).',
  'cron-view-title': 'Cron String',
  'crow-view-example-description':
    'Temporal Workflow Schedule Cron strings follow this format:',
  'cron-view-description':
    'Write or paste in a cron string to generate a schedule.',
  'error-title': 'Error Message',
  'name-label': 'Name',
  'workflow-id-label': 'Workflow Id',
  'workflow-type-label': 'Workflow Type',
  'task-queue-label': 'Task Queue',
  'getting-started-docs-link-preface': 'Go to',
  'getting-started-docs-link': 'docs',
  'getting-started-cli-link-preface': 'or get started with',
} as const;
