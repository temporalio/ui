import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';

describe('WorkflowCatalogList client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  });

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('filters examples and dispatches Quick Run through the shared session host', async () => {
    const target = await client.renderList();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    button('Shared')?.click();
    client.flushSync();
    expect(target.textContent).toContain('Order lifecycle');
    expect(target.textContent).not.toContain('Payment reminder');

    const search = target.querySelector<HTMLInputElement>(
      '#workflow-catalog-search',
    );
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

    button('Run')?.click();
    const command = await client.waitForStart();
    expect(command).toMatchObject({
      exampleId: 'order-lifecycle',
      input: ['customer-123'],
      startOptions: { workflowId: 'order-lifecycle-01' },
    });
    await client.flush();
    expect(target.textContent).toContain('Completed');
  });
});
