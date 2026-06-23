import { expect, type Page, test } from '@playwright/test';

import { mockClusterApi } from '~/test-utilities/mocks/cluster';
import { mockNamespaceApi } from '~/test-utilities/mocks/namespace';
import { mockNamespacesApi } from '~/test-utilities/mocks/namespaces';
import { mockSearchAttributesApi } from '~/test-utilities/mocks/search-attributes';
import { mockSettingsApi } from '~/test-utilities/mocks/settings';
import { mockSystemInfoApi } from '~/test-utilities/mocks/system-info';
import { WORKFLOWS_API } from '~/test-utilities/mocks/workflows';
import { mockWorkflowsCountApi } from '~/test-utilities/mocks/workflows-count';

function makeUserCookie(accessToken: string) {
  return btoa(
    JSON.stringify({
      AccessToken: accessToken,
      IDToken: 'test-id-token',
      Name: 'Test User',
      Email: 'test@test.com',
      Picture: '',
    }),
  );
}

async function mockAuthApis(page: Page) {
  await Promise.all([
    mockClusterApi(page),
    mockNamespacesApi(page),
    mockSystemInfoApi(page),
    mockNamespaceApi(page),
    mockSearchAttributesApi(page),
    mockWorkflowsCountApi(page),
    mockSettingsApi(page, { Auth: { Enabled: true, Options: null } }),
  ]);
}

test('sets Authorization Bearer header from user cookie', async ({
  page,
  baseURL,
}) => {
  await mockAuthApis(page);

  let capturedAuthHeader: string | null = null;
  await page.route(WORKFLOWS_API, async (route, request) => {
    capturedAuthHeader = request.headers()['authorization'] ?? null;
    await route.fulfill({ json: { executions: [], nextPageToken: null } });
  });

  await page.context().addCookies([
    {
      name: 'user0',
      value: makeUserCookie('test-access-token-123'),
      domain: 'localhost',
      path: '/',
    },
  ]);

  const workflowsResponse = page.waitForResponse(WORKFLOWS_API);
  await page.goto(baseURL);
  await workflowsResponse;

  expect(capturedAuthHeader).toBe('Bearer test-access-token-123');
});

test('refreshes token and retries request on 401', async ({
  page,
  baseURL,
}) => {
  await mockAuthApis(page);

  let workflowCallCount = 0;
  const authHeaders: string[] = [];
  let refreshCalled = false;

  await page.route(WORKFLOWS_API, async (route, request) => {
    workflowCallCount++;
    authHeaders.push(request.headers()['authorization'] ?? '');

    if (workflowCallCount === 1) {
      await route.fulfill({ status: 401, body: 'Unauthorized' });
    } else {
      await route.fulfill({ json: { executions: [], nextPageToken: null } });
    }
  });

  await page.route('**/auth/refresh**', async (route) => {
    refreshCalled = true;
    await page.context().addCookies([
      {
        name: 'user0',
        value: makeUserCookie('refreshed-token-456'),
        domain: 'localhost',
        path: '/',
      },
    ]);
    await route.fulfill({
      status: 200,
      headers: {
        'Set-Cookie': `user0=${makeUserCookie('refreshed-token-456')}; Path=/`,
      },
    });
  });

  await page.context().addCookies([
    {
      name: 'user0',
      value: makeUserCookie('expired-token'),
      domain: 'localhost',
      path: '/',
    },
  ]);

  const retryResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/namespaces') &&
      response.url().includes('workflows') &&
      response.status() === 200,
  );
  await page.goto(baseURL);
  await retryResponse;

  expect(refreshCalled).toBe(true);
  expect(workflowCallCount).toBe(2);
  expect(authHeaders[0]).toBe('Bearer expired-token');
  expect(authHeaders[1]).toBe('Bearer refreshed-token-456');
});
