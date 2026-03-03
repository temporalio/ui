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
import { mockNamespaceApi } from './mocks/namespace';
import { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
import { mockSchedulesApi } from './mocks/schedules';
import { mockSchedulesCountApi } from './mocks/schedules-count';
import { mockSearchAttributesApi } from './mocks/search-attributes';
import { mockSettingsApi, SETTINGS_API } from './mocks/settings';
import { mockSystemInfoApi } from './mocks/system-info';
import { mockTaskQueuesApi, TASK_QUEUES_API } from './mocks/task-queues';
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
  NAMESPACE_API,
} from './mocks/namespace';
export { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
export { mockSettingsApi, SETTINGS_API } from './mocks/settings';
export { mockSystemInfoApi } from './mocks/system-info';

export {
  mockSearchAttributesApi,
  SEARCH_ATTRIBUTES_API,
} from './mocks/search-attributes';
export { mockScheduleApi, SCHEDULE_API } from './mocks/schedules';
export {
  mockSchedulesCountApi,
  SCHEDULES_COUNT_API,
} from './mocks/schedules-count';
export { mockWorkflowsApi, WORKFLOWS_API } from './mocks/workflows';
export {
  mockWorkflowApi,
  mockWorkflowPauseApi,
  mockWorkflowUnpauseApi,
  WORKFLOW_API,
  WORKFLOW_PAUSE_API,
  WORKFLOW_UNPAUSE_API,
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
export { EVENT_HISTORY_API, mockEventHistoryApi } from './mocks/event-history';
export { mockTaskQueuesApi, TASK_QUEUES_API } from './mocks/task-queues';

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
    mockWorkflowsCountApi(page, emptySchedulesCount),
  ]);
};

export const mockNamespaceApis = (page: Page) => {
  return Promise.all([
    mockGlobalApis(page),
    mockNamespaceApi(page),
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
