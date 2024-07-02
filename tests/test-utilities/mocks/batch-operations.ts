import { Page } from '@playwright/test';

export const CREATE_BATCH_OPERATION_API = '**/namespaces/*/batch-operations*';

export const DESCRIBE_BATCH_OPERATION_API =
  '**/namespaces/*/batch-operations/*';

export const mockCreateBatchOperationApi = (page: Page) => {
  return page.route(CREATE_BATCH_OPERATION_API, (route) => {
    route.fulfill({ json: {} });
  });
};

export const mockDescribeBatchOperationApi = (page: Page) => {
  return page.route(DESCRIBE_BATCH_OPERATION_API, (route) => {
    route.fulfill({ json: { state: 'COMPLETED', completeOperationCount: 10 } });
  });
};
