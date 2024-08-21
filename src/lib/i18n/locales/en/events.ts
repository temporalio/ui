export const Namespace = 'events' as const;

export const Strings = {
  'empty-state-title': 'No Events Match',
  'empty-state-description':
    'There are no events that match your filters or selected view. Adjust your filters or view to see your events.',
  'group-empty-state-title': 'Event Group Not Found',
  'sort-ascending': 'Sort 1-9',
  'sort-descending': 'Sort 9-1',
  'date-and-time': 'Date & Time',
  'show-elapsed-time': 'Show Elapsed Time & Duration',
  'event-type': 'Event Type',
  'workflow-events': 'Workflow Events',
  category: {
    all: 'All',
    activity: 'Activity',
    'child-workflow': 'Child Workflow',
    command: 'Command',
    other: 'Other',
    'local-activity': 'Local Activity',
    marker: 'Marker',
    nexus: 'Nexus',
    signal: 'Signal',
    timer: 'Timer',
    update: 'Update',
    workflow: 'Workflow',
  },
  'attribute-group': {
    activity: 'Activity',
    parent: 'Parent',
    'retry-policy': 'Retry Policy',
    schedule: 'Schedule',
    'search-attributes': 'Search Attributes',
    summary: 'Summary',
    'task-queue': 'Task Queue',
    workflow: 'Workflow',
  },
  'custom-search-attributes': 'Custom Search Attributes',
  'custom-search': 'custom search',
  attribute: 'attribute',
  'event-group': 'Events related to {{eventName}}',
  'error-event': 'Error Event',
  'import-event-history': 'Import Event History',
  'import-event-history-file-upload':
    'Select an event history JSON file to upload',
  'event-history-view': 'Event History View',
  'api-history-link': 'View in Github',
  'history-expected-formats': 'Expected JSON formats',
  'event-history-import-error': 'Could not create event history from JSON',
  'event-history-load-error': 'Could not parse JSON',
  'event-classification-label': 'Event Classification',
  'event-classification': {
    unspecified: 'Unspecified',
    scheduled: 'Scheduled',
    open: 'Open',
    new: 'New',
    started: 'Started',
    initiated: 'Initiated',
    running: 'Running',
    completed: 'Completed',
    fired: 'Fired',
    cancelrequested: 'Cancel Requested',
    timedout: 'Timed Out',
    signaled: 'Signaled',
    canceled: 'Canceled',
    failed: 'Failed',
    terminated: 'Terminated',
  },
  'decode-event-history': 'Decode Event History',
  encoded: 'Encoded',
  decoded: 'Decoded',
  'decoded-description': 'Codec Server decoded and base64 encoded',
  readable: 'Human Readable',
  'readable-description': 'Codec Server decoded and base64 decoded',
} as const;
