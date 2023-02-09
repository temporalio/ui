import { test, expect } from '@playwright/test';
import { mockDate } from '@utilities/mock-date';

const workflowsUrl = '/namespaces/default/workflows';
const workflowsApiMatch = new RegExp('/api/v1/namespaces/default/workflows');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(mockDate);

  await page.goto(workflowsUrl);
});

const timeFrames = [
  {
    period: '15 minutes',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-19T11%3A45%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '1 hour',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-19T11%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '3 hours',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-19T09%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '24 hours',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-18T12%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '3 days',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-16T12%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '7 days',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-09-12T12%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '30 days',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-08-20T12%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
  {
    period: '90 days',
    query:
      'http://localhost:3333/namespaces/default/workflows?search=basic&query=StartTime+BETWEEN+%222012-06-21T12%3A00%3A00-06%3A00%22+AND+%222012-09-20T12%3A00%3A00-06%3A00%22',
  },
];

for (const { period, query } of timeFrames) {
  test(`updates time range in the query when #time-range-filter is changed to ${period}`, async ({
    page,
  }) => {
    await page.locator('#time-range-filter').selectOption(period);
    await page.waitForRequest(workflowsApiMatch);

    expect(page.url()).toBe(query);
  });
}
