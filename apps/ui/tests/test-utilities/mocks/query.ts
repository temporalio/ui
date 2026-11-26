import { Page } from '@playwright/test';

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
    /\/api\/v1\/namespaces\/default\/workflows\/[^/]+\/runs\/[^/]+\/query/,
    async (route) => {
      route.fulfill({ json });
    },
  );
}
