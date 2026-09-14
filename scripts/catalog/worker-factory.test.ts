import { describe, expect, it, vi } from 'vitest';

import { createCatalogWorkerFactory } from './worker-factory';

describe('createCatalogWorkerFactory', () => {
  it('calls Worker.create with the Worker class as its receiver', async () => {
    const worker = {
      run: vi.fn(async () => undefined),
      shutdown: vi.fn(),
    };
    const workerClass = {
      create(this: unknown, options: { taskQueue: string }) {
        expect(this).toBe(workerClass);
        expect(options).toEqual({ taskQueue: 'catalog-queue' });
        return Promise.resolve(worker);
      },
    };

    const createWorker = createCatalogWorkerFactory(workerClass);

    await expect(createWorker({ taskQueue: 'catalog-queue' })).resolves.toBe(
      worker,
    );
  });
});
