export const Namespace = 'workflows' as const;

export const Strings = {
  'recent-workflows': 'Recent Workflows',
  'workflows-count_one': '{{count, number}} workflow',
  'workflows-count_other': '{{count, number}} workflows',
  'filtered-workflows-count':
    'Results {{filtered, number}} of $t(workflows-count, { "count": {{total}} })',
  terminate: 'Terminate',
  cancel: 'Cancel',
  terminated: 'Terminated',
  canceled: 'Canceled',
  reason: 'Reason',
  'batch-operation-modal-title': '{{action}} Workflows',
  'batch-operation-confirmation-placeholder': '{{action}} from the Web UI',
  'batch-operation-confirmation-placeholder-by-email':
    '{{action}} from the Web UI by {{email}}',
  'batch-operation-confirmation-all':
    'Are you sure you want to {{action}} all workflows matching the following query? This action cannot be undone.',
  'batch-operation-count-disclaimer':
    'Note: The actual count of workflows that will be affected is the total number of running workflows matching this query at the time of clicking "{{action}}".',
  'batch-cancel-confirmation_one':
    'Are you sure you want to Cancel {{count, number}} running workflow?',
  'batch-cancel-confirmation_other':
    'Are you sure you want to Cancel {{count, number}} running workflows?',
  'batch-terminate-confirmation_one':
    'Are you sure you want to Terminate {{count, number}} running workflow?',
  'batch-terminate-confirmation_other':
    'Are you sure you want to Terminate {{count, number}} running workflows?',
  'batch-operation-confirmation-input-hint':
    'If you supply a custom reason, "{{placeholder}}" will be appended to it.',
  'batch-terminate-all-success':
    'The batch $t(terminate) request is processing in the background.',
  'batch-cancel-all-success':
    'The batch $t(cancel) request is processing in the background.',
  'batch-terminate-success': 'Successfully $t(terminated) {{count}} workflows.',
  'batch-cancel-success': 'Successfully $(canceled) {{count}} workflows.',
  'configure-workflows': 'Configure Workflow List',
  'configure-workflows-description':
    'Add (<1></1>), re-arrange (<2></2>), and remove (<3></3>), Workflow Headings to personalize the Workflow List Table.',
} as const;
