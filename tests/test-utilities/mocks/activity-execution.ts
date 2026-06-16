import type { Page } from '@playwright/test';

import type { ActivityExecution } from '$src/lib/types/activity-execution';

export const STANDALONE_ACTIVITY_API =
  /\/api\/v1\/namespaces\/[^/]+\/activities\/[^/]+(\?.*)?$/;
export const STANDALONE_ACTIVITY_PAUSE_API =
  /\/api\/v1\/namespaces\/[^/]+\/activities\/[^/]+\/pause/;
export const STANDALONE_ACTIVITY_UNPAUSE_API =
  /\/api\/v1\/namespaces\/[^/]+\/activities\/[^/]+\/unpause/;
export const STANDALONE_ACTIVITY_RESET_API =
  /\/api\/v1\/namespaces\/[^/]+\/activities\/[^/]+\/reset/;
export const STANDALONE_ACTIVITY_UPDATE_OPTIONS_API =
  /\/api\/v1\/namespaces\/[^/]+\/activities\/[^/]+\/update-options/;

const baseActivityExecutionInfo = {
  activityId: 'greet-activity',
  runId: '2d2e1234-5678-90ab-cdef-1234567890ab',
  activityType: { name: 'greet' },
  taskQueue: 'default',
  status: 'ACTIVITY_EXECUTION_STATUS_RUNNING',
  scheduleTime: '2025-01-01T00:00:00Z',
  lastStartedTime: '2025-01-01T00:00:01Z',
  closeTime: null,
  executionDuration: '60s',
  stateTransitionCount: '3',
  attempt: 1,
  scheduleToCloseTimeout: '0s',
  scheduleToStartTimeout: '0s',
  startToCloseTimeout: '30s',
  heartbeatTimeout: '0s',
  currentRetryInterval: '1s',
  searchAttributes: { indexedFields: {} },
  retryPolicy: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '100s',
    maximumAttempts: 0,
  },
} as unknown as ActivityExecution['info'];

export const mockRunningActivityExecution: ActivityExecution = {
  runId: baseActivityExecutionInfo.runId,
  longPollToken: 'long-poll-token',
  info: {
    ...baseActivityExecutionInfo,
    runState: 'PENDING_ACTIVITY_STATE_RUNNING',
  },
};

export const mockPausedActivityExecution: ActivityExecution = {
  runId: baseActivityExecutionInfo.runId,
  longPollToken: 'long-poll-token',
  info: {
    ...baseActivityExecutionInfo,
    runState: 'PENDING_ACTIVITY_STATE_PAUSED',
    pauseInfo: {
      manual: {
        reason: 'Testing activity pause',
        identity: 'test-user',
      },
      pauseTime: '2025-01-01T00:00:00Z',
    },
  } as unknown as ActivityExecution['info'],
};

/**
 * Mocks the standalone activity GET endpoint used by the StandaloneActivityPoller.
 *
 * The poller first fetches the activity (no longPollToken) and, while the activity
 * is running, issues a long-poll request (with a longPollToken). We let the long-poll
 * request hang so the poller idles on a single pending request rather than busy-looping,
 * while the initial fetch and subsequent `fetchOnce` refreshes resolve to the current state.
 */
export const mockStandaloneActivityApi = (
  page: Page,
  getExecution: () => ActivityExecution,
) => {
  return page.route(STANDALONE_ACTIVITY_API, (route) => {
    if (route.request().url().includes('longPollToken')) {
      return;
    }
    return route.fulfill({ json: getExecution() });
  });
};

export const mockStandaloneActivityPauseApi = (page: Page) => {
  return page.route(STANDALONE_ACTIVITY_PAUSE_API, (route) =>
    route.fulfill({ json: {} }),
  );
};

export const mockStandaloneActivityUnpauseApi = (page: Page) => {
  return page.route(STANDALONE_ACTIVITY_UNPAUSE_API, (route) =>
    route.fulfill({ json: {} }),
  );
};

export const mockStandaloneActivityResetApi = (page: Page) => {
  return page.route(STANDALONE_ACTIVITY_RESET_API, (route) =>
    route.fulfill({ json: {} }),
  );
};

export const mockStandaloneActivityUpdateOptionsApi = (page: Page) => {
  return page.route(STANDALONE_ACTIVITY_UPDATE_OPTIONS_API, (route) =>
    route.fulfill({ json: { activityOptions: {} } }),
  );
};
