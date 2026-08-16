import type { Page, TestInfo } from '@playwright/test';

type AxeResults = import('axe-core').AxeResults;
export type WithScreenshot<T> = T & { screenshot: string };

export const attachViolations = async (
  testInfo: TestInfo,
  results: AxeResults,
  page: Page,
) => {
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      const element = await page.$(node.target.join(' '));

      if (element && (await element.isVisible())) {
        const screenshot = await element
          .screenshot({ timeout: 2_000 })
          .catch(() => null);

        if (screenshot) {
          (node as WithScreenshot<typeof node>).screenshot =
            screenshot.toString('base64');
        }
      }
    }
  }

  return testInfo.attach('violations', {
    body: JSON.stringify(
      {
        title: testInfo.title,
        url: page.url(),
        violations: results.violations,
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
};
