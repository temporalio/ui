import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCrashActivity } from './crash';

const activityInfo = vi.hoisted(() => ({ attempt: 1 }));

vi.mock('@temporalio/activity', () => ({
  Context: { current: () => ({ info: activityInfo }) },
}));

describe('catalog Worker crash', () => {
  beforeEach(() => {
    activityInfo.attempt = 1;
  });

  it('exits the process on the first attempt', async () => {
    const exit = vi.fn();
    const log = vi.fn();
    const { dangerousOperation } = createCrashActivity({
      enabled: true,
      exit,
      log,
    });

    await dangerousOperation();

    expect(exit).toHaveBeenCalledWith(75);
    expect(log).toHaveBeenCalledWith(
      'Catalog Worker is exiting on purpose to demonstrate a crash.',
    );
  });

  it('reports recovery instead of exiting again on a retry', async () => {
    const exit = vi.fn();
    activityInfo.attempt = 2;
    const { dangerousOperation } = createCrashActivity({
      enabled: true,
      exit,
    });

    await expect(dangerousOperation()).resolves.toBe(
      'Worker recovered. Attempt 2 ran on a new Worker.',
    );
    expect(exit).not.toHaveBeenCalled();
  });

  it('fails without retrying when the workspace does not declare the crash control', async () => {
    const exit = vi.fn();
    const { dangerousOperation } = createCrashActivity({
      enabled: false,
      exit,
    });

    await expect(dangerousOperation()).rejects.toMatchObject({
      nonRetryable: true,
      type: 'CatalogCrashDisabled',
    });
    expect(exit).not.toHaveBeenCalled();
  });
});
