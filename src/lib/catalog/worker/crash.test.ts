import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  catalogControlsFromEnvironment,
  createCrashActivity,
  effectiveCatalogControls,
} from './crash';

const activityInfo = vi.hoisted(() => ({ attempt: 1 }));

vi.mock('@temporalio/activity', () => ({
  Context: { current: () => ({ info: activityInfo }) },
}));

describe('catalog Worker crash', () => {
  beforeEach(() => {
    activityInfo.attempt = 1;
  });

  it('provides the crash control only when the runtime turns it on', () => {
    expect(catalogControlsFromEnvironment({ CATALOG_CONTROL: 'on' })).toEqual([
      'crash',
    ]);
    expect(catalogControlsFromEnvironment({})).toEqual([]);
    expect(catalogControlsFromEnvironment({ CATALOG_CONTROL: 'true' })).toEqual(
      [],
    );
  });

  it('enables only controls that the workspace declares and the runtime provides', () => {
    expect(effectiveCatalogControls(['crash'], ['crash'])).toEqual(['crash']);
    expect(effectiveCatalogControls(['crash'], [])).toEqual([]);
    expect(effectiveCatalogControls(undefined, ['crash'])).toEqual([]);
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

  it('fails without retrying when the crash control is off', async () => {
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
