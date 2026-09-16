import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  closeCatalogClientTestRunner,
  getCatalogClientTestRunner,
} from './catalog-client-test-runner';
import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';

describe('CatalogDetail client interactions', () => {
  let client: Awaited<ReturnType<typeof getCatalogClientTestRunner>>;

  beforeAll(async () => {
    client = await getCatalogClientTestRunner();
  }, catalogHarnessSetupTimeoutMs);

  afterEach(async () => client.cleanup());
  afterAll(closeCatalogClientTestRunner);

  it('announces changed readiness status without changing the visible label', async () => {
    const target = await client.renderDetail({ deferReadiness: true });

    const readinessPanel = target.querySelector('[aria-label="Readiness"]');
    const liveStatus = readinessPanel?.querySelector(
      '[aria-live="polite"].sr-only',
    );

    expect(liveStatus?.textContent).toBe('Worker readiness is checking');
    expect(readinessPanel?.textContent).toContain('Handler worker is polling');

    await client.resolveReadiness([
      { kind: 'worker', required: false, state: 'ready', taskQueueType: 1 },
    ]);

    expect(liveStatus?.textContent).toBe('Worker readiness is ready');
    expect(readinessPanel?.textContent).toContain('Handler worker is polling');
  });

  it('announces prerequisite changes while readiness row labels remain stable', async () => {
    const workerReady = {
      kind: 'worker' as const,
      required: false as const,
      state: 'ready' as const,
      taskQueueType: 1 as const,
    };
    const target = await client.renderDetail({
      readinessResponses: [
        [
          workerReady,
          {
            kind: 'nexus-endpoint',
            required: true,
            state: 'unavailable',
            endpoint: 'greeting-endpoint',
          },
        ],
        [
          workerReady,
          {
            kind: 'nexus-endpoint',
            required: true,
            state: 'ready',
            endpoint: 'greeting-endpoint',
          },
        ],
      ],
    });
    await client.flush();
    const readinessPanel = target.querySelector('[aria-label="Readiness"]');
    const liveStatus = readinessPanel?.querySelector(
      '[aria-live="polite"].sr-only',
    );

    expect(liveStatus?.textContent).toBe(
      'Worker readiness is ready. Nexus endpoint readiness is unavailable',
    );
    expect(readinessPanel?.textContent).toContain('Handler worker is polling');
    expect(readinessPanel?.textContent).toContain(
      'Endpoint matches the declared target and policy',
    );

    const refresh = Array.from(
      target.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Refresh');
    refresh?.click();
    await client.flush();

    expect(liveStatus?.textContent).toBe(
      'Worker readiness is ready. Nexus endpoint readiness is ready',
    );
    expect(readinessPanel?.textContent).toContain('Handler worker is polling');
    expect(readinessPanel?.textContent).toContain(
      'Endpoint matches the declared target and policy',
    );
  });

  it('runs the execution id it shows and then shows the next one', async () => {
    const target = await client.renderDetail({ pinExecutionId: false });
    await client.flush();
    const shownId = () =>
      target.querySelector<HTMLInputElement>('#catalog-execution-id')?.value;
    const before = shownId();

    expect(before).toBeTruthy();

    Array.from(target.querySelectorAll('button'))
      .find((candidate) => candidate.textContent?.trim() === 'Start')
      ?.click();
    await client.waitForStart();
    await client.flush();

    expect(shownId()).not.toBe(before);
    expect(shownId()).not.toBe('');
  });

  it('keeps start options after the section is collapsed and reopened', async () => {
    const target = await client.renderDetail();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    button('Start options')?.click();
    client.flushSync();
    button('Start options')?.click();
    client.flushSync();
    button('Start options')?.click();
    client.flushSync();

    button('Start')?.click();

    expect(await client.waitForStart()).toMatchObject({
      startOptions: { workflowId: 'order-lifecycle-01' },
    });
  });

  it('supports configuration, dispatch, readiness refresh, and keyboard tooltip access', async () => {
    const target = await client.renderDetail();
    await client.flush();
    const button = (label: string) =>
      Array.from(target.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    button('Start options')?.click();
    client.flushSync();
    expect(target.querySelector('#catalog-start-options')).not.toBeNull();

    const readinessCalls = client.getReadinessCallCount();
    button('Refresh')?.click();
    await client.flush();
    expect(client.getReadinessCallCount()).toBe(readinessCalls + 1);

    const runButton = button('Start');
    expect(runButton).toBeInstanceOf(HTMLButtonElement);
    expect((runButton as HTMLButtonElement | undefined)?.disabled).toBe(false);
    runButton?.click();
    const command = await client.waitForStart();
    expect(command).toMatchObject({
      exampleId: 'order-lifecycle',
      input: ['customer-123'],
      startOptions: { workflowId: 'order-lifecycle-01' },
    });
    await client.flush();

    const readinessIcon = target.querySelector<HTMLElement>(
      '[aria-label^="Worker readiness"]',
    );
    readinessIcon?.focus();
    client.flushSync();
    const tooltip = readinessIcon
      ?.closest('.wrapper')
      ?.querySelector('[role="tooltip"]');

    expect(document.activeElement).toBe(readinessIcon);
    expect(tooltip?.textContent).toContain('A Worker is polling.');
    expect(tooltip?.classList).not.toContain('hidden');
  });
});
