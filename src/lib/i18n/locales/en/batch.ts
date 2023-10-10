export const Namespace = 'batch' as const;

export const Strings = {
  'nav-title': 'Batch',
  'list-page-title': 'Batch Operations',
  'describe-page-title': 'Batch Operation',
  'empty-state-title': 'No Batch Operations',
  'back-link': 'Back to Batch Operations',
  'operation-type': 'Operation Type',
  details: 'Operation Details',
  identity: 'Identity',
  'total-operations': 'Total Operations',
  'operations-failed': '{{ count, number }} failed',
  'operations-succeeded': '{{ count, number }} succeeded',
  'operations-progress': '{{ percent }}% complete',
  results: 'Operation Results',
  'max-concurrent-alert-title': 'Maximum concurrent Batch Operations met',
  'max-concurrent-alert-description':
    'Only 1 in progress Batch Operation is permitted. If you are attempting to create a new Batch Operation while there is one currently running, it will fail.',
  'job-id-input-hint':
    'Job ID must be unique. If left blank, a randomly generated UUID will be used.',
  'job-id-input-error': 'Job ID must only contain URL safe characters',
} as const;
