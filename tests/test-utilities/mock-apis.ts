import type { Page } from '@playwright/test';
import { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
import { mockClusterApi, CLUSTER_API } from './mocks/cluster';
import { mockSettingsApi, SETTINGS_API } from './mocks/settings';
import {
  mockSearchAttributesApi,
  SEARCH_ATTRIBUTES_API,
} from './mocks/search-attributes';
import { mockWorkflowsApi, WORKFLOWS_API } from './mocks/workflows';
import { mockNamespaceApi } from './mocks/namespace';
import {
  mockWorkflowsCountApi,
  WORKFLOWS_COUNT_API,
} from './mocks/workflows-count';
import {
  mockDescribeBatchOperationApi,
  mockCreateBatchOperationApi,
} from './mocks/batch-operations';

export { mockClusterApi, CLUSTER_API } from './mocks/cluster';
export { mockNamespaceApi, NAMESPACE_API } from './mocks/namespace';
export { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
export { mockSettingsApi, SETTINGS_API } from './mocks/settings';
export {
  mockSearchAttributesApi,
  SEARCH_ATTRIBUTES_API,
} from './mocks/search-attributes';
export { mockWorkflowsApi, WORKFLOWS_API } from './mocks/workflows';
export {
  mockWorkflowsCountApi,
  WORKFLOWS_COUNT_API,
} from './mocks/workflows-count';
export {
  mockCreateBatchOperationApi,
  mockDescribeBatchOperationApi,
} from './mocks/batch-operations';

export const mockGlobalApis = (page: Page) => {
  return Promise.all([
    mockClusterApi(page),
    mockNamespacesApi(page),
    mockSettingsApi(page),
  ]);
};

export const mockWorkflowsApis = (page: Page) => {
  return Promise.all([
    mockGlobalApis(page),
    mockWorkflowsApi(page),
    mockSearchAttributesApi(page),
    mockWorkflowsCountApi(page),
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

/**
 * Waits for requests that occur on initial load of ever page, i.e. cluster, settings, etc.
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
 * Waits for requests that occur on the initial load of the Workflows page
 * @param page a playwright Page object
 * @param waitForCount boolean - whether to wait for the Workflows Count Api - which only gets requested when advanced visibility in enabled
 * @returns Promise<Request[]>
 */
export const waitForWorkflowsApis = (page: Page, waitForCount = true) => {
  const requests = [
    waitForGlobalApis(page),
    page.waitForResponse(WORKFLOWS_API),
    page.waitForResponse(SEARCH_ATTRIBUTES_API),
  ];

  if (waitForCount) requests.push(page.waitForResponse(WORKFLOWS_COUNT_API));

  return Promise.all(requests);
};
