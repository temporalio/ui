export const Namespace = 'standalone-nexus-operations' as const;

export const Strings = {
  'standalone-nexus-operations': 'Standalone Nexus Operations',
  'standalone-nexus-operations-disabled':
    'Standalone Nexus Operations are disabled for this Namespace.',
  'standalone-nexus-operations-enablement':
    'If you want to enable Standalone Nexus Operations globally, please ensure the following values are set in Dynamic Config.',
  'standalone-nexus-operations-enablement-per-namespace':
    'If you want to enable Standalone Nexus Operations for this namespace only, include the following',
  'nexus-operations-plural_one': 'Standalone Nexus Operation',
  'nexus-operations-plural_other': 'Standalone Nexus Operations',
  'recent-nexus-operations': 'Recent Standalone Nexus Operations',
  'nexus-operations-error-querying': 'Error querying nexus operations',
  'nexus-operation-query-error-state': 'Error Filtering Nexus Operations',
  'all-nexus-operations': 'All',
  'running-nexus-operations': 'Running',
  'completed-nexus-operations': 'Completed',
  'failed-nexus-operations': 'Failed',
  'canceled-nexus-operations': 'Canceled',
  'terminated-nexus-operations': 'Terminated',
  'timed-out-nexus-operations': 'Timed Out',
  'empty-state-title': 'No Nexus Operations Found',
  'empty-state-description': 'No nexus operations match the current filters.',
  'nexus-operations-table': 'Standalone Nexus Operations Table',
  'empty-state-no-data-title':
    "This namespace doesn't have any Standalone Nexus Operations yet.",
  'empty-state-value-proposition':
    'Standalone Nexus Operations can call any Temporal-hosted endpoint from existing code using a simple SDK client call - no need to set up a Workflow or run a worker. Get all the durable execution benefits like automatic retries, timeouts, and at-least-once execution guarantees out of the box.',
  'empty-state-read-docs-prefix': 'Read the',
  'empty-state-nexus-docs-link': 'Nexus Docs',
  'empty-state-read-docs-middle': 'and check out the',
  'empty-state-nexus-eval-guide-link': 'Nexus Evaluation Guide',
  'empty-state-read-docs-suffix':
    'to learn how Nexus can fit into your operations.',
  'empty-state-code-samples-title':
    'Explore code samples for Standalone Nexus Operations',
  'start-standalone-nexus-operation': 'Start a Standalone Nexus Operation',
  'back-to-nexus-operations': 'Back to Standalone Nexus Operations',
  'layout-tabs-label': 'Nexus Operation Details',
  'layout-details-tab': 'Details',
  'layout-search-attributes-tab': 'Search Attributes',
  'layout-user-metadata-tab': 'Metadata',
  'operation-id': 'Operation ID',
  'run-id': 'Run ID',
  'operation-token': 'Operation Token',
  'request-id': 'Request ID',
  identity: 'Identity',
  endpoint: 'Endpoint',
  service: 'Service',
  operation: 'Operation',
  state: 'State',
  'blocked-reason': 'Blocked Reason',
  'schedule-time': 'Schedule Time',
  'expiration-time': 'Expiration Time',
  'close-time': 'End',
  'execution-duration': 'Execution Duration',
  'state-transitions': 'State Transitions',
  attempt: 'Attempt',
  'last-attempt-complete-time': 'Last Attempt Complete Time',
  'next-attempt-schedule-time': 'Next Attempt Schedule Time',
  'last-attempt-failure': 'Last Attempt Failure',
  'schedule-to-close-timeout': 'Schedule To Close Timeout',
  'schedule-to-start-timeout': 'Schedule To Start Timeout',
  'start-to-close-timeout': 'Start To Close Timeout',
  'cancellation-info': 'Cancellation',
  'cancellation-requested-time': 'Requested Time',
  'cancellation-state': 'Cancellation State',
  'cancellation-reason': 'Reason',
  'nexus-header': 'Nexus Header',
  'operation-event-history': 'Operation Event History',
  'run-details-section': 'Run Details',
  'operation-details-section': 'Operation Details',
  'attempt-section': 'Attempt',
  'timeout-configuration': 'Timeout Configuration',
  'endpoint-name': 'Endpoint Name',
  'service-name': 'Service Name',
  'operation-name': 'Operation Name',
  'handler-namespace': 'Handler Namespace',
  'handler-operation-link': 'Handler Operation Link',
  'handler-namespace-note':
    'Note: Links will only work if your account has access permissions to the handler namespace.',
  'request-cancellation': 'Request Cancellation',
  'cancel-modal-title': 'Cancel Nexus Operation',
  'cancel-modal-confirmation':
    'Are you sure you want to request cancellation of this Nexus Operation?',
  'cancel-success': 'Cancellation requested successfully.',
  terminate: 'Terminate',
  'terminate-modal-title': 'Terminate Nexus Operation',
  'terminate-modal-confirmation':
    'Are you sure you want to terminate this Nexus Operation?',
  'terminate-success': 'Nexus Operation terminated successfully.',
  'start-nexus-operation-like-this-one': 'Start Nexus Operation Like This One',
  'form-page-description':
    'Use a Standalone Nexus Operation to invoke a Nexus Operation in a different namespace.',
  'form-page-allowlist-note':
    'Note: For this operation to succeed, this namespace ({{namespace}}) must be on the allowlist for the endpoint to be called.',
  'form-nexus-operation-details-heading': 'Nexus Operation Details',
  'form-operation-id-label': 'Operation ID',
  'form-operation-id-body':
    'The unique ID of this Standalone Nexus Operation. If left blank, we will generate a unique ID.',
  'form-operation-id-required': 'Operation ID is required.',
  'form-endpoint-label': 'Target Endpoint Name',
  'form-endpoint-body': 'The endpoint name in the target (handler) namespace.',
  'form-endpoint-required': 'Target endpoint name is required.',
  'form-service-label': 'Service Name',
  'form-service-body':
    "The name of the Service in the handler's namespace. A non-exact match will result in an operation failure.",
  'form-service-required':
    'Nexus Service Name from the handler Namespace is required.',
  'form-operation-name-label': 'Operation Name',
  'form-operation-name-body':
    "The name of the Operation in the handler's namespace. A non-exact match will result in an operation failure.",
  'form-operation-name-required':
    "Operation Name from the handler Namespace's services is required.",
  'form-timeout-required':
    'At least one timeout (Start To Close or Schedule To Close) is required.',
  'form-timeouts-heading': 'Timeouts',
  'form-schedule-to-close-timeout-label': 'Schedule To Close Timeout',
  'form-schedule-to-start-timeout-label': 'Schedule To Start Timeout',
  'form-start-to-close-timeout-label': 'Start To Close Timeout',
  'form-random-uuid': 'Random UUID',
  'form-operation-policies-heading': 'Operation Policies',
  'form-operation-policies-description':
    "Operation policies allow you to customize this Nexus Operation's behavior. Read more about",
  'form-operation-policies-link': 'Nexus Operation policies',
  'form-edit-operation-policies': 'Edit Operation Policies',
  'form-closed-operation-id-reuse-label': 'Closed Operation ID Reuse',
  'form-running-operation-id-conflict-label':
    'Running Operation ID Conflict Handling',
  'form-timeouts-summary-label': 'Timeouts',
  'form-timeouts-default': 'Default timeouts (unlimited time)',
  'form-id-reuse-policy-default': 'Allowed',
  'form-id-conflict-policy-default': 'Fail without starting',
  'form-id-policies-heading': 'ID Policies',
  'form-id-reuse-policy-label': 'ID Reuse Policy',
  'form-id-conflict-policy-label': 'ID Conflict Policy',
  'form-nexus-header-heading': 'Nexus Header',
  'form-nexus-header-key-placeholder': 'Key',
  'form-nexus-header-value-placeholder': 'Value',
  'form-add-nexus-header': 'Add Header',
  'form-search-attributes-heading': 'Search Attributes',
  'form-search-attributes-description':
    'Custom fields used to filter Nexus Operations in tables and lists.',
  'form-user-metadata-heading': 'User Metadata',
  'form-user-metadata-description':
    'Add context to the Nexus Operation to help identify and understand its operations.',
  'operation-summary-heading': 'Operation Summary',
  'operation-summary-start-date': 'Start date',
  'operation-summary-target-endpoint': 'Target Endpoint and Namespace',
  'operation-summary-service-name': 'Service Name',
  'operation-summary-operation-name': 'Operation Name',
  'form-nexus-operation-started': 'Nexus Operation started.',
  'form-operation-id-duplicate-toast':
    'Unable to create Standalone Nexus Operation because the Operation ID is already in use by an existing operation.',
  'form-operation-id-duplicate-error':
    'Operation ID already in use. Change Operation ID Reuse Policy to any option but Do not allow duplicate Operation IDs to resolve.',
  'form-operation-id-duplicate-completed-toast':
    'Unable to create Standalone Nexus Operation because the Operation ID is already in use by a completed operation.',
  'form-operation-id-duplicate-completed-error':
    'Operation ID already in use by a completed operation. Change Operation ID Reuse Policy to allow duplicates or choose a different Operation ID.',
  'form-operation-id-conflict-toast':
    'Unable to create Standalone Nexus Operation because the Operation ID is already in use by an existing operation.',
  'form-operation-id-conflict-hint': 'Operation ID already in use.',
  'form-operation-id-conflict-banner-prefix':
    'This Operation ID is already in use by',
  'form-operation-id-conflict-banner-suffix':
    ". Because this operation was still running at the time of Standalone Nexus Operation creation, it conflicts with your ID Conflict policy and cannot be created. If the running operation may be closing shortly, you can try again. Otherwise, use a different Operation ID, cancel or terminate the currently running operation, or leave this field blank and we'll generate a unique operation ID for you.",
  'form-id-reuse-policy-heading': 'Closed Operation ID Reuse Policy',
  'form-id-reuse-policy-description':
    'Determine whether or not to allow this Standalone Nexus Operation to share the same Operation ID with an Operation in a completed, canceled, terminated, timed out, or failed state.',
  'form-id-conflict-policy-heading': 'Running Operation ID Conflict Policy',
  'form-id-conflict-policy-description':
    'Determine what happens when the Operation ID is already in use by a running Nexus Operation.',
  'form-timeouts-description':
    'Define how long an Operation should wait for a response before considering it failed.',
  'form-id-reuse-policy-allow-duplicate-label':
    'Allow duplicate Operation IDs (default)',
  'form-id-reuse-policy-allow-duplicate-description':
    'Allows multiple Operations to run with the same Operation ID.',
  'form-id-reuse-policy-allow-duplicate-failed-only-label':
    'Allow duplicates only if duplicate belongs to a canceled, terminated, timed out, or failed operation',
  'form-id-reuse-policy-allow-duplicate-failed-only-description':
    'Duplication will not be allowed if the Operation ID belongs to an Operation with a completed state.',
  'form-id-reuse-policy-reject-duplicate-label':
    'Do not allow duplicate Operation IDs',
  'form-id-reuse-policy-reject-duplicate-description':
    'Does not allow the start of the Operation if the ID is duplicated in an existing any Operation.',
  'form-id-conflict-policy-fail-label':
    'Fail new operation before Start (default)',
  'form-id-conflict-policy-fail-description':
    'Creates the operation but does not start it.',
  'form-id-conflict-policy-use-existing-label':
    'Do not start; return handle of Operation with ID already in use',
  'form-id-conflict-policy-use-existing-description':
    "Does not start the new Operation, but returns a link for the running Operation in the new Operation's Details so you can troubleshoot.",
  'form-schedule-to-close-timeout-hint':
    'If not set or set to zero, no timeout will be enforced. Max timeout 60 days.',
  'form-schedule-to-start-timeout-hint':
    'If not set or set to zero, no timeout will be enforced.',
  'form-start-to-close-timeout-hint':
    'If not set or set to zero, no timeout will be enforced.',
  'form-update-policies-button': 'Update Policies',
} as const;
