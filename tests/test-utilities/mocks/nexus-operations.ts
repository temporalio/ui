import type { Page } from '@playwright/test';

export const NEXUS_OPERATIONS_API =
  /\/api\/v1\/namespaces\/[^/]+\/nexus-operations(\?.*)?$/;
export const NEXUS_OPERATION_API =
  /\/api\/v1\/namespaces\/[^/]+\/nexus-operations\/[^/]+(\?.*)?$/;
export const NEXUS_OPERATION_COUNT_API =
  /\/api\/v1\/namespaces\/[^/]+\/nexus-operation-count(\?.*)?$/;

export const MOCK_NEXUS_OPERATION = {
  runId: 'run-abc-123',
  info: {
    operationId: 'op-abc-123',
    runId: 'run-abc-123',
    endpoint: 'my-endpoint',
    service: 'my-service',
    operation: 'my-operation',
    status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING',
    state: '',
    scheduleToCloseTimeout: '3600s',
    scheduleToStartTimeout: '',
    startToCloseTimeout: '1800s',
    attempt: 1,
    scheduleTime: '2024-01-01T00:00:00Z',
    expirationTime: '2024-01-01T01:00:00Z',
    closeTime: '',
    lastAttemptCompleteTime: '',
    nextAttemptScheduleTime: '',
    executionDuration: '',
    blockedReason: '',
    requestId: 'req-abc-123',
    operationToken: '',
    stateTransitionCount: '1',
    searchAttributes: { indexedFields: {} },
    nexusHeader: {},
    userMetadata: { summary: null, details: null },
    links: [],
    identity: 'test-identity',
  },
  input: null,
  result: null,
  failure: null,
  longPollToken: '',
};

const MOCK_NEXUS_OPERATIONS_LIST = {
  operations: [
    {
      operationId: 'op-abc-123',
      runId: 'run-abc-123',
      endpoint: 'my-endpoint',
      service: 'my-service',
      operation: 'my-operation',
      scheduleTime: '2024-01-01T00:00:00Z',
      closeTime: '',
      status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING',
      searchAttributes: { indexedFields: {} },
      stateTransitionCount: '1',
      executionDuration: '',
    },
  ],
  nextPageToken: '',
};

const MOCK_NEXUS_OPERATION_COUNT = {
  count: '1',
};

export const mockNexusOperationsApi = (page: Page, empty = false) => {
  return page.route(NEXUS_OPERATIONS_API, (route) => {
    route.fulfill({
      json: empty
        ? { operations: [], nextPageToken: '' }
        : MOCK_NEXUS_OPERATIONS_LIST,
    });
  });
};

export const mockNexusOperationApi = (
  page: Page,
  operation = MOCK_NEXUS_OPERATION,
) => {
  return page.route(NEXUS_OPERATION_API, (route) => {
    route.fulfill({ json: operation });
  });
};

export const mockNexusOperationCountApi = (page: Page, empty = false) => {
  return page.route(NEXUS_OPERATION_COUNT_API, (route) => {
    route.fulfill({
      json: empty ? { count: '0' } : MOCK_NEXUS_OPERATION_COUNT,
    });
  });
};
