import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { mockNamespaceApis } from '~/test-utilities/mock-apis';

const exampleQuestions = [
  'Why is Workflow order-123 stuck?',
  'How many Workflows failed in the last hour?',
  'Is any Worker polling the orders Task Queue?',
  'Which Namespaces can you read?',
];

test.beforeEach(async ({ page }) => {
  await mockNamespaceApis(page);
  await page.goto('/namespaces/default/agents');
});

test('shows the agents resource hub', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Agents', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agent Harness', level: 2 }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'GitHub repository for Agent Harness' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/temporal-community/temporal-agent-harness',
  );

  await expect(
    page.getByRole('heading', { name: 'Skills', level: 2 }),
  ).toBeVisible();
  await expect(page.getByText('· Public Preview')).toHaveCount(2);
  await expect(
    page.getByText('npx skills add temporalio/skill-temporal-ops'),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Open Google ADK integration' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Resources', level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Cookbooks and Demos',
      level: 3,
    }),
  ).toBeVisible();
});

test('shows the MCP Server card and copies its prompts', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await expect(
    page.getByRole('heading', { name: 'MCP Server', level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'GitHub repository for MCP Server',
    }),
  ).toHaveAttribute('href', 'https://github.com/temporalio/temporal-mcp');
  await expect(
    page.getByRole('button', { name: /, copy question$/ }),
  ).toHaveText(exampleQuestions);

  await page
    .getByRole('button', { name: `${exampleQuestions[0]}, copy question` })
    .click();

  await expect(
    page.getByRole('button', { name: `${exampleQuestions[0]}, copied` }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: `${exampleQuestions[1]}, copy question` }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(exampleQuestions[0]);

  await page
    .getByRole('button', {
      name: 'Install MCP server with your agent',
      exact: true,
    })
    .click();

  await expect(
    page.getByRole('button', {
      name: 'Install MCP server with your agent, copied',
    }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('https://github.com/temporalio/temporal-mcp');
});

test('keeps each copied question on its own timer', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.clock.install();
  await page.reload();

  const question = (index: number, state: 'copy question' | 'copied') =>
    page.getByRole('button', { name: `${exampleQuestions[index]}, ${state}` });

  await expect(question(0, 'copy question')).toBeVisible();
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);

  await question(0, 'copy question').click();
  await expect(question(0, 'copied')).toBeVisible();
  await page.clock.runFor(1500);

  await question(1, 'copy question').click();
  await expect(question(1, 'copied')).toBeVisible();
  await page.clock.runFor(700);

  await expect(question(0, 'copy question')).toBeVisible();
  await expect(question(1, 'copied')).toBeVisible();

  await page.clock.runFor(1400);
  await expect(question(1, 'copy question')).toBeVisible();
});

for (const width of [320, 375, 1280, 1440, 1800]) {
  test(`keeps every card within the page at ${width}px`, async ({
    page,
    isMobile,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- Each width sets its own viewport.
    test.skip(isMobile, 'Viewport is set explicitly');

    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole('heading', { name: 'MCP Server', level: 2 }),
    ).toBeVisible();

    const overflowing = await page
      .locator('.agents-page')
      .evaluate((agentsPage) => {
        const pageRight = agentsPage.getBoundingClientRect().right;

        return Array.from(agentsPage.querySelectorAll('section'))
          .filter(
            (section) =>
              section.scrollWidth > section.clientWidth ||
              section.getBoundingClientRect().right > pageRight + 0.5,
          )
          .map((section) => section.getAttribute('aria-labelledby'));
      });

    expect(overflowing).toEqual([]);
  });
}

test('has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await expect(
    page.getByRole('button', { name: /, copy question$/ }),
  ).toHaveCount(4);

  const results = await new AxeBuilder({ page })
    .include('.agents-page')
    .options({ rules: { 'label-content-name-mismatch': { enabled: true } } })
    .analyze();

  expect(results.violations).toEqual([]);
});
