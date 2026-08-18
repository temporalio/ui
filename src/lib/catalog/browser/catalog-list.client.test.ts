import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';
import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';

describe('CatalogList client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  }, catalogHarnessSetupTimeoutMs);

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('filters examples and dispatches Quick Run through the shared session host', async () => {
    const target = await client.renderList();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    button('OSS')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Order lifecycle');
    expect(target.textContent).not.toContain('Payment reminder');
    expect(target.textContent).not.toContain('Cloud example');

    button('Cloud')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Cloud example');
    expect(target.textContent).not.toContain('Order lifecycle');

    button('Local')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Payment reminder');
    expect(target.textContent).not.toContain('Cloud example');

    button('OSS')?.click();
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
