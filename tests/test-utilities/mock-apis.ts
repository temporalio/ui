import type { Page } from '@playwright/test';

import {
  mockCreateBatchOperationApi,
  mockDescribeBatchOperationApi,
} from './mocks/batch-operations';
import { CLUSTER_API, mockClusterApi } from './mocks/cluster';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
  mockEventHistoryApi,
} from './mocks/event-history';
import {
  mockNamespaceApi,
  mockNamespaceWithNexusOperations,
  mockNamespaceWithNoWorkerHeartbeats,
} from './mocks/namespace';
import { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
import {
  mockNexusOperationCountApi,
  mockNexusOperationsApi,
} from './mocks/nexus-operations';
import { mockSchedulesApi } from './mocks/schedules';
import { mockSchedulesCountApi } from './mocks/schedules-count';
import { mockSearchAttributesApi } from './mocks/search-attributes';
import { mockSettingsApi, SETTINGS_API } from './mocks/settings';
import { mockSystemInfoApi } from './mocks/system-info';
import { mockTaskQueuesApi, TASK_QUEUES_API } from './mocks/task-queues';
import { mockWorkersApi } from './mocks/workers';
import { mockWorkflow, mockWorkflowApi, WORKFLOW_API } from './mocks/workflow';
import { mockWorkflowsApi, WORKFLOWS_API } from './mocks/workflows';
import {
  mockWorkflowsCountApi,
  WORKFLOWS_COUNT_API,
} from './mocks/workflows-count';

import {
  SearchAttributesResponse,
  WorkflowExecutionAPIResponse,
} from '$src/lib/types/workflows';

export { mockClusterApi, CLUSTER_API } from './mocks/cluster';
export {
  mockNamespaceApi,
  mockNamespaceWithPauseCapability,
  mockNamespaceWithNoWorkerHeartbeats,
  NAMESPACE_API,
} from './mocks/namespace';
export { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
export { mockSettingsApi, SETTINGS_API } from './mocks/settings';
export { mockSystemInfoApi } from './mocks/system-info';

export {
  mockSearchAttributesApi,
  SEARCH_ATTRIBUTES_API,
} from './mocks/search-attributes';
export {
  mockMonthlyCalendarSchedule,
  mockSchedule,
  mockScheduleApi,
  mockWeeklyCalendarSchedule,
  SCHEDULE_API,
} from './mocks/schedules';
export {
  mockSchedulesCountApi,
  SCHEDULES_COUNT_API,
} from './mocks/schedules-count';
export { mockWorkflowsApi, WORKFLOWS_API } from './mocks/workflows';
export {
  mockWorkflowApi,
  mockWorkflowPauseApi,
  mockWorkflowUnpauseApi,
  mockWorkflowWithRunningActivity,
  mockWorkflowWithPausedActivity,
  mockActivityPauseApi,
  mockActivityUnpauseApi,
  mockActivityResetApi,
  mockActivityUpdateOptionsApi,
  WORKFLOW_API,
  WORKFLOW_PAUSE_API,
  WORKFLOW_UNPAUSE_API,
  ACTIVITY_PAUSE_API,
  ACTIVITY_UNPAUSE_API,
  ACTIVITY_RESET_API,
  ACTIVITY_UPDATE_OPTIONS_API,
} from './mocks/workflow';
export {
  mockWorkflowsCountApi,
  mockWorkflowsGroupByCountApi,
  WORKFLOWS_COUNT_API,
} from './mocks/workflows-count';
export {
  mockCreateBatchOperationApi,
  mockDescribeBatchOperationApi,
  CREATE_BATCH_OPERATION_API,
  DESCRIBE_BATCH_OPERATION_API,
} from './mocks/batch-operations';
export {
  mockRunningActivityExecution,
  mockPausedActivityExecution,
  mockStandaloneActivityApi,
  mockStandaloneActivityPauseApi,
  mockStandaloneActivityUnpauseApi,
  mockStandaloneActivityResetApi,
  mockStandaloneActivityUpdateOptionsApi,
  STANDALONE_ACTIVITY_API,
  STANDALONE_ACTIVITY_PAUSE_API,
  STANDALONE_ACTIVITY_UNPAUSE_API,
  STANDALONE_ACTIVITY_RESET_API,
  STANDALONE_ACTIVITY_UPDATE_OPTIONS_API,
} from './mocks/activity-execution';
export { EVENT_HISTORY_API, mockEventHistoryApi } from './mocks/event-history';
export { mockTaskQueuesApi, TASK_QUEUES_API } from './mocks/task-queues';
export { mockWorkersApi, WORKERS_API } from './mocks/workers';
export {
  mockNexusOperationsApi,
  mockNexusOperationApi,
  mockNexusOperationCountApi,
  NEXUS_OPERATIONS_API,
  NEXUS_OPERATION_API,
  NEXUS_OPERATION_COUNT_API,
  MOCK_NEXUS_OPERATION,
} from './mocks/nexus-operations';
export { mockNamespaceWithNexusOperations } from './mocks/namespace';

export const mockGlobalApis = (page: Page) => {
  return Promise.all([
    mockClusterApi(page),
    mockNamespacesApi(page),
    mockSettingsApi(page),
    mockSystemInfoApi(page),
  ]);
};

export const mockWorkflowsApis = (page: Page) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceApi(page),
    mockWorkflowsApi(page),
    mockSearchAttributesApi(page),
    mockWorkflowsCountApi(page),
  ]);
};

export const mockSchedulesApis = (
  page: Page,
  empty = false,
  emptySchedulesCount = false,
  customSearchAttributes?: Partial<SearchAttributesResponse>,
) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceApis(page),
    mockSearchAttributesApi(page, customSearchAttributes),
    mockSchedulesApi(page, empty),
    mockSchedulesCountApi(page, emptySchedulesCount),
  ]);
};

export const mockNamespaceApis = (page: Page) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceApi(page),
    mockSearchAttributesApi(page),
  ]);
};

export const mockWorkersPageApis = (
  page: Page,
  { empty = false, heartbeatsEnabled = true } = {},
) => {
  return Promise.all([
    mockGlobalApis(page),
    heartbeatsEnabled
      ? mockNamespaceApi(page)
      : mockNamespaceWithNoWorkerHeartbeats(page),
    mockSearchAttributesApi(page),
    mockWorkersApi(page, empty),
  ]);
};

export const mockNexusOperationsApis = (page: Page, { empty = false } = {}) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceWithNexusOperations(page),
    mockNexusOperationsApi(page, empty),
    mockNexusOperationCountApi(page, empty),
    mockSearchAttributesApi(page),
  ]);
};

export const mockBatchOperationApis = (page: Page) => {
  return Promise.all([
    mockCreateBatchOperationApi(page),
    mockDescribeBatchOperationApi(page),
  ]);
};

export const mockWorkflowApis = (
  page: Page,
  workflow: WorkflowExecutionAPIResponse = mockWorkflow,
) => {
  return Promise.all([
    mockNamespaceApis(page),
    mockNamespaceApi(page),
    mockWorkflowApi(page, workflow),
    mockEventHistoryApi(page),
    mockTaskQueuesApi(page),
  ]);
};

/**
 * Waits for requests that occur on initial load of every page, i.e. cluster, settings, etc.
 * @param page a playwright Page object
 * @returns Promise<Request[]>
 */
export const waitForGlobalApis = (page: Page) => {
  return Promise.all([
    page.waitForResponse(CLUSTER_API),
    page.waitForResponse(NAMESPACES_API),
    page.waitForResponse(SETTINGS_API),
  ]);
};

/**
 * Waits for requests that occur on navigation to the Workflows page, excluding global APIs
 * @param page a playwright Page object
 * @param waitForCount boolean - whether to wait for the Workflows Count Api - which only gets requested when advanced visibility in enabled
 * @returns Promise<Request[]>
 */
export const waitForWorkflowsApis = (page: Page, waitForCount = true) => {
  const requests = [page.waitForResponse(WORKFLOWS_API)];

  if (waitForCount) requests.push(page.waitForResponse(WORKFLOWS_COUNT_API));

  return Promise.all(requests);
};

export const waitForWorkflowApis = (page: Page) => {
  return Promise.all([
    page.waitForResponse(WORKFLOW_API),
    page.waitForResponse(EVENT_HISTORY_API),
    page.waitForResponse(EVENT_HISTORY_API_REVERSE),
    page.waitForResponse(TASK_QUEUES_API),
  ]);
};
