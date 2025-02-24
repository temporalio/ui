export const Namespace = 'nexus' as const;

export const Strings = {
  nexus: 'Nexus',
  'nexus-endpoint': 'Nexus Endpoint | {{id}}',
  endpoint: 'Endpoint',
  endpoints: 'Nexus Endpoints',
  'all-endpoints': 'All Endpoints',
  'my-endpoints': 'My Endpoints',
  'back-to-endpoints': 'Back To Nexus Endpoints',
  'back-to-endpoint': 'Back To Nexus Endpoint',
  'create-endpoint': 'Create Nexus Endpoint',
  'endpoint-name': 'Endpoint Name',
  'endpoint-name-placeholder': 'Nexus Endpoint must have a unique name',
  'select-endpoint': 'Select a Endpoint',
  'task-queue-placeholder': 'Enter a Task Queue',
  'endpoint-alias': 'Endpoint Alias',
  target: 'Target',
  'target-description':
    'Specify the target Namespace and task queue the worker will poll on.',
  'target-namespace': 'Target Namespace',
  'select-namespace': 'Select a Namespace',
  'nexus-description':
    'Add a link to your repo or instructions to help other users in this account use this endpoint.',
  'description-placeholder':
    '//Provide a readme for users to use this endpoint',
  handler: 'Handler',
  'delete-endpoint': 'Delete Endpoint',
  'delete-modal-title': 'Delete Nexus Endpoint?',
  'delete-modal-confirmation-preface': 'Are you sure you want to delete ',
  'delete-modal-confirmation-postface':
    'Any Workflows calling this endpoint will encounter failures.',
  'type-confirm-preface': 'Type ',
  'type-confirm-postface': 'to delete this endpoint.',
  'endpoint-name-hint':
    'Endpoint name must start with A-Z, a-z or _ and can only contain A-Z, a-z, 0-9, or _',
  'endpoint-name-hint-with-dash':
    'Endpoint name must start with A-Z or a-z and can only contain A-Z, a-z, 0-9 or -',
  'access-policy': 'Access Policy',
  'allowed-caller-namespaces': 'Allowed caller Namespaces',
  'allowed-caller-namespaces-description':
    'Namespace(s) that are allowed to call this Endpoint.',
  'select-namespaces': 'Select Namespace(s)',
  'selected-namespaces_one': '{{count}} Namespace selected',
  'selected-namespaces_other': '{{count}} Namespaces selected',
  'empty-state': 'No Nexus Endpoints found, try a new search.',
  'nexus-callback': 'Nexus Callback',
  callback: {
    standby: 'Nexus Callback is standing by, waiting to be triggered.',
    scheduled:
      'Nexus Callback is in the queue waiting to be executed or is currently executing.',
    'backing-off':
      'Nexus Callback has failed with a retryable error and is backing off before the next attempt.',
    failed: 'Nexus Callback has failed.',
    succeeded: 'Nexus Callback has succeeded.',
  },
  'callback-url': 'Callback URL',
  'last-attempt-completed-time': 'Last Attempt Completed Time',
  'next-attempt-scheduled-time': 'Next Attempt Scheduled Time',
  'last-attempt-failure': 'Last Attempt Failure',
  'blocked-reason': 'Blocked Reason',
  link: 'Link',
  'link-namespace': 'Link Namespace',
} as const;
