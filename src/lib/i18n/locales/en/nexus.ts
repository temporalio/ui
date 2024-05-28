export const Namespace = 'nexus' as const;

export const Strings = {
  nexus: 'Nexus',
  endpoint: 'Endpoint',
  endpoints: 'Nexus Endpoints',
  'all-endpoints': 'All Endpoints',
  'my-endpoints': 'My Endpoints',
  'back-to-endpoints': 'Back To Nexus Endpoints',
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
  'delete-modal-confirmation':
    'Are you sure you want to delete {{endpoint}}? Any Workflows calling this endpoint will encounter failures.',
  'delete-modal-confirmation-label':
    'Type “DELETE {{endpoint}}" to delete this endpoint.',
} as const;
