import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';
import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';

describe('CatalogCreate client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  }, catalogHarnessSetupTimeoutMs);

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('scaffolds a valid Local ID and opens the returned files', async () => {
    const target = await client.renderCreate();
    const input = target.querySelector<HTMLInputElement>('#catalog-local-id');

    expect(input?.labels?.[0]?.textContent).toContain('Local workflow ID');
    input!.value = 'payment-reminder';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await client.flush();

    expect(client.getScaffoldedIds()).toEqual(['payment-reminder']);
    expect(target.textContent).toContain('workflow.ts');
    expect(target.textContent).toContain('example.ts');
    expect(
      target.querySelector('[aria-label="Edit workflow.ts"]'),
    ).not.toBeNull();
  });

  it('announces an invalid Local ID without scaffolding or opening an editor', async () => {
    const target = await client.renderCreate();
    const input = target.querySelector<HTMLInputElement>('#catalog-local-id')!;

    for (const invalidId of ['1invalid', 'a'.repeat(129), 'create']) {
      input.value = invalidId;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      target.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
      await client.flush();
    }

    expect(client.getScaffoldedIds()).toEqual([]);
    expect(target.textContent).toContain(
      'lowercase letters, numbers, and hyphens',
    );
    expect(target.querySelector('[aria-label^="Edit "]')).toBeNull();
  });
});
