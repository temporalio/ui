import { describe, expect, it, vi } from 'vitest';

import { createReadinessLoader } from './readiness-loader';
import type { ReadinessCheck, WorkbenchHost } from './workbench-host';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
};

const host = (
  checkReadiness: WorkbenchHost['checkReadiness'],
): WorkbenchHost => ({
  start: vi.fn(),
  checkReadiness,
  observe: vi.fn(),
  evidenceLink: vi.fn(),
});

describe('createReadinessLoader', () => {
  it('aborts and ignores stale readiness requests', async () => {
    const first = deferred<ReadinessCheck[]>();
    const second = deferred<ReadinessCheck[]>();
    const signals: AbortSignal[] = [];
    const catalogHost = host((_exampleId, signal) => {
      signals.push(signal as AbortSignal);
      return signals.length === 1 ? first.promise : second.promise;
    });
    const loader = createReadinessLoader(() => catalogHost);

    const stale = loader.load('first');
    const current = loader.load('second');
    expect(signals[0]?.aborted).toBe(true);
    first.resolve([]);
    second.resolve([
      { kind: 'worker', required: false, state: 'ready', taskQueueType: 1 },
    ]);

    await expect(stale).resolves.toEqual({ state: 'stale' });
    await expect(current).resolves.toMatchObject({ state: 'current' });

    const canceled = loader.load('third');
    loader.cancel();
    expect(signals[2]?.aborted).toBe(true);
    await expect(canceled).resolves.toEqual({ state: 'stale' });
  });

  it('distinguishes current readiness failures from aborts', async () => {
    const errorHost = host(async () => {
      throw new Error('unavailable');
    });
    const abortHost = host(async () => {
      throw new DOMException('Canceled', 'AbortError');
    });

    await expect(
      createReadinessLoader(() => errorHost).load('example'),
    ).resolves.toEqual({ state: 'error' });
    await expect(
      createReadinessLoader(() => abortHost).load('example'),
    ).resolves.toEqual({ state: 'stale' });
  });
});
