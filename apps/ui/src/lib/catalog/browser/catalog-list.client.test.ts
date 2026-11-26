import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';
import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';
import {
  nexusOperationExecution,
  testDescriptor,
  workflowExecution,
} from './catalog-test-descriptors';

describe('CatalogList client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  }, catalogHarnessSetupTimeoutMs);

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('warns when no worker is polling', async () => {
    const target = await client.renderList({
      workerState: 'unavailable',
      workerStartCommand: 'pnpm catalog worker',
    });
    await client.flush();
    const alert = target.querySelector(
      '[data-testid="catalog-worker-unavailable"]',
    );

    expect(alert?.classList.contains('hidden')).toBe(false);
    expect(alert?.textContent).toContain('No Worker is polling');
    expect(alert?.textContent).toContain('pnpm catalog worker');
  });

  it('omits the start command when the host does not provide one', async () => {
    const target = await client.renderList({ workerState: 'unavailable' });
    await client.flush();
    const alert = target.querySelector(
      '[data-testid="catalog-worker-unavailable"]',
    );

    expect(alert?.classList.contains('hidden')).toBe(false);
    expect(alert?.textContent).not.toContain('Start one with');
  });

  it('does not warn when a worker is polling', async () => {
    const target = await client.renderList();
    await client.flush();

    expect(
      target
        .querySelector('[data-testid="catalog-worker-unavailable"]')
        ?.classList.contains('hidden'),
    ).toBe(true);
  });

  const buttons = (target: HTMLElement, selector = 'button') =>
    Array.from(target.querySelectorAll<HTMLButtonElement>(selector));
  const facet = (target: HTMLElement, label: string, group = '') =>
    target.querySelector<HTMLButtonElement>(
      `nav[aria-label="Filter examples"] ${group} button[aria-label^="${label}, "]`,
    ) ?? undefined;
  const facetCount = (target: HTMLElement, label: string) =>
    facet(target, label)?.lastElementChild?.textContent?.trim();
  const summary = (target: HTMLElement) =>
    target
      .querySelector('[data-testid="catalog-summary"]')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();

  it('filters examples and dispatches Quick Run through the shared session host', async () => {
    const target = await client.renderList();
    await client.flush();
    const button = (label: string) =>
      buttons(target).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    expect(facetCount(target, 'All sources')).toBe('3');
    expect(facetCount(target, 'OSS')).toBe('1');

    facet(target, 'OSS')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Order lifecycle');
    expect(target.textContent).not.toContain('Payment reminder');
    expect(target.textContent).not.toContain('Cloud example');

    facet(target, 'Cloud')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Cloud example');
    expect(target.textContent).not.toContain('Order lifecycle');

    facet(target, 'Local')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Payment reminder');
    expect(target.textContent).not.toContain('Cloud example');

    facet(target, 'OSS')?.click();
    client.flushSync();

    const search = target.querySelector<HTMLInputElement>('#catalog-search');
    expect(search).toBeInstanceOf(HTMLInputElement);
    if (search) {
      search.value = 'payment';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    client.flushSync();
    expect(target.textContent).toContain(
      'No examples match the current filters.',
    );
    expect(target.textContent).not.toContain('Order lifecycle');
    expect(facetCount(target, 'Local')).toBe('1');

    if (search) {
      search.value = 'order';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    client.flushSync();
    expect(target.textContent).toContain('Order lifecycle');

    button('Start')?.click();
    const command = await client.waitForStart();
    expect(command).toMatchObject({
      exampleId: 'order-lifecycle',
      input: ['customer-123'],
      startOptions: { workflowId: 'order-lifecycle-01' },
    });
    await client.flush();
    expect(target.textContent).toContain('Completed');
  });

  it('filters by execution kind and feature, and clears each filter', async () => {
    const target = await client.renderList();
    await client.flush();

    facet(target, 'Standalone Activity', '[data-facet="kind"]')?.click();
    client.flushSync();
    expect(summary(target)).toMatch(/^0 of 3 examples Standalone Activity/);
    expect(target.textContent).toContain(
      'No examples match the current filters.',
    );

    buttons(
      target,
      '[aria-label="Remove filter Standalone Activity"]',
    )[0]?.click();
    client.flushSync();
    expect(summary(target)).toBe('3 of 3 examples');

    const tag = buttons(
      target,
      '[aria-label="Order lifecycle features"] button',
    ).find((candidate) => candidate.textContent?.trim() === 'Workflow');
    tag?.click();
    client.flushSync();
    expect(tag?.getAttribute('aria-pressed')).toBe('true');
    expect(
      facet(target, 'Workflow', '[data-facet="feature"]')?.getAttribute(
        'aria-pressed',
      ),
    ).toBe('true');
    expect(
      facet(target, 'Workflow', '[data-facet="kind"]')?.getAttribute(
        'aria-pressed',
      ),
    ).toBe('false');

    facet(target, 'Local')?.click();
    client.flushSync();
    facet(target, 'Workflow', '[data-facet="feature"]')?.click();
    client.flushSync();
    expect(summary(target)).toBe('1 of 3 examples Local Clear filters');
    facet(target, 'Workflow', '[data-facet="feature"]')?.click();
    client.flushSync();
    expect(summary(target)).toMatch(/^1 of 3 examples Workflow Local/);

    buttons(target)
      .find((candidate) => candidate.textContent?.trim() === 'Clear filters')
      ?.click();
    client.flushSync();
    expect(summary(target)).toBe('3 of 3 examples');
  });

  it('shows the kind, location, and source of each example', async () => {
    const target = await client.renderList({
      descriptors: [
        testDescriptor('order-workflow', workflowExecution(), ['retries']),
        testDescriptor('slow-nexus', nexusOperationExecution, [
          'child-workflows',
        ]),
      ],
    });
    await client.flush();
    const rows = Array.from(
      target.querySelectorAll('[data-testid="catalog-example"]'),
    );
    const text = (row: Element, testId: string) =>
      row
        .querySelector(`[data-testid="${testId}"]`)
        ?.textContent?.replace(/\s+/g, ' ')
        .trim();

    expect(rows.map((row) => text(row, 'catalog-kind-badge'))).toEqual([
      'Workflow',
      'Standalone Nexus Operation',
    ]);
    expect(rows.map((row) => text(row, 'catalog-location'))).toEqual([
      'Task Queue catalog-tasks',
      'Nexus Endpoint catalog-endpoint',
    ]);
    expect(rows.map((row) => text(row, 'catalog-source'))).toEqual([
      'OSS',
      'OSS',
    ]);
    expect(rows[1]?.textContent).toContain('Child Workflows');
    expect(facetCount(target, 'Standalone Nexus Operation')).toBe('1');
    expect(facetCount(target, 'Standalone Activity')).toBe('0');
  });

  it('starts from the given filters and reports only later changes', async () => {
    const changes: unknown[] = [];
    const target = await client.renderList({
      initialFilters: {
        query: '',
        kind: null,
        feature: null,
        source: 'local',
      },
      onfilterschange: (filters) => changes.push(filters),
    });
    await client.flush();

    expect(summary(target)).toBe('1 of 3 examples Local Clear filters');
    expect(changes).toEqual([]);
    expect(facet(target, 'Local')?.getAttribute('aria-label')).toBe(
      'Local, 1 example',
    );

    facet(target, 'Workflow', '[data-facet="kind"]')?.click();
    await client.flush();

    expect(changes.at(-1)).toEqual({
      query: '',
      kind: 'workflow',
      feature: null,
      source: 'local',
    });
  });

  it('uses the host-provided href for the Configure action', async () => {
    const target = await client.renderList({
      exampleHref: (exampleId: string) => `/cloud/catalog/${exampleId}`,
    });
    await client.flush();

    const configure = target.querySelector<HTMLAnchorElement>(
      'a[aria-label="Configure"]',
    );

    expect(configure?.getAttribute('href')).toBe(
      '/cloud/catalog/order-lifecycle',
    );
  });

  it('links the latest run badge to the workflow details page for that run', async () => {
    const target = await client.renderList();
    await client.flush();
    const evidenceLink = () =>
      target.querySelector<HTMLAnchorElement>(
        'a[aria-label="Workflow details"]',
      );
    const run = Array.from(target.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === 'Start',
    );

    expect(evidenceLink()).toBeNull();

    run?.click();
    await client.waitForStart();
    await client.flush();

    expect(evidenceLink()?.querySelector('svg')).not.toBeNull();
    expect(evidenceLink()?.getAttribute('href')).toBe(
      '/workflows/order-lifecycle/run-1',
    );
    expect(target.textContent).toContain('Completed');
  });
});
