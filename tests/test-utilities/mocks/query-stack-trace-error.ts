import { Page } from '@playwright/test';
import { apiUrl } from '~test-utilities/mock-apis';

const json = {
  queryResult: {
    payloads: [
      {
        an: 'error',
      },
    ],
  },
  queryRejected: null,
};

export default async function mockQueryApiWithStackTraceError(page: Page) {
  await page.route(
    apiUrl + '/namespaces/default/workflows/*/runs/*/query*',
    async (route) => {
      route.fulfill({ json });
    },
  );
}
