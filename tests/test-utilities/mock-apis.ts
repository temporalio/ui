import type { Page } from '@playwright/test';
import { mockNamespacesApi } from './mocks/namespaces';
import { mockClusterApi } from './mocks/cluster';
import { mockSettingsApi } from './mocks/settings';
import { mockSearchAttributesApi } from './mock-apis';
import { mockWorkflowsApi } from './mock-apis';
import { mockNamespaceApi } from './mock-apis';

export { mockClusterApi } from './mocks/cluster';
export { mockNamespaceApi } from './mocks/namespace';
export { mockNamespacesApi } from './mocks/namespaces';
export { mockSettingsApi } from './mocks/settings';
export { mockSearchAttributesApi } from './mocks/search-attributes';
export { mockWorkflowsApi } from './mocks/workflows';

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
  ]);
};

export const mockNamespaceApis = (page: Page) => {
  return Promise.all([mockGlobalApis(page), mockSearchAttributesApi(page)]);
};
