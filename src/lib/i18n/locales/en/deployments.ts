export const Namespace = 'deployments' as const;

export const Strings = {
  deployments: 'Deployments',
  'worker-deployments': 'Worker Deployments',
  'empty-state-title': 'No Deployments yet.',
  'error-message-fetching': 'Error fetching deployments',
  'empty-state-description':
    'Want to learn about versioning? <value proposition about versioning and why you should use it>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae lacus eu mauris facilisis sodales.',
  'deployments-table': {
    name: 'Deployment Name',
    'current-version': 'Current Version',
    created: 'Created At',
    ramping: 'Ramping Version and Status',
    workflows: 'Go to Workflows',
  },
  'back-to-deployments': 'Back to Worker Deployments',
  'current-build-id': 'Current Build ID',
  'series-name': 'Series Name',
} as const;
