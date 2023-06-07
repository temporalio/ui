import type { Page } from '@playwright/test';
import { mockNamespacesApi } from './mocks/namespaces';
import { mockClusterApi } from './mocks/cluster';
import { mockSettingsApi } from './mocks/settings';

export { mockClusterApi, CLUSTER_API } from './mocks/cluster';
export { mockNamespaceApi, NAMESPACE_API } from './mocks/namespace';
export { mockNamespacesApi, NAMESPACES_API } from './mocks/namespaces';
export { mockSettingsApi, SETTINGS_API } from './mocks/settings';
export {
  mockSearchAttributesApi,
  SEARCH_ATTRIBUTES_API,
} from './mocks/search-attributes';
export { WORKFLOWS_API } from './mocks/workflows';

export const mockGlobalApis = (page: Page) => {
  return Promise.all([
    mockClusterApi(page),
    mockNamespacesApi(page),
    mockSettingsApi(page),
  ]);
};
