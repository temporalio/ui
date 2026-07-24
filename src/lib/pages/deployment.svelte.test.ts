import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { page } from '$app/state';

import { translate } from '$lib/i18n/translate';
import {
  fetchDeployment,
  validateCurrentWorkerDeploymentVersionComputeConfig,
} from '$lib/services/deployments-service';
import type { WorkerDeploymentResponse } from '$lib/types/deployments';

import {
  createLatestDeploymentRefresher,
  isCurrentDeploymentRoute,
  scheduleConnectionStatusRefreshes,
  updateDeploymentRefreshState,
} from './deployment.svelte';
import Deployment from './deployment.svelte';

vi.mock('$lib/services/deployments-service', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('$lib/services/deployments-service')
  >()),
  fetchDeployment: vi.fn(),
  validateCurrentWorkerDeploymentVersionComputeConfig: vi.fn(),
}));

const deployment = {
  conflictToken: 'token',
  workerDeploymentInfo: {
    name: 'deployment',
    createTime: undefined,
    routingConfig: {
      currentDeploymentVersion: {
        deploymentName: 'deployment',
        buildId: 'build-id',
      },
    },
    currentVersionSummary: {
      version: 'deployment.build-id',
      createTime: undefined,
    },
    lastModifierIdentity: 'test',
    versionSummaries: [
      {
        version: 'deployment.build-id',
        deploymentVersion: {
          deploymentName: 'deployment',
          buildId: 'build-id',
        },
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
        createTime: undefined,
        computeConfig: {
          scalingGroups: { default: { providerType: 'aws-lambda' } },
        },
      },
    ],
  },
} as unknown as WorkerDeploymentResponse;

const renderDeployment = async () => {
  const target = document.body.appendChild(document.createElement('div'));
  const component = mount(Deployment, { target });
  await Promise.resolve();
  flushSync();
  return { component, target };
};

const clickValidateConnection = async () => {
  document.querySelector<HTMLButtonElement>('[aria-label="Actions"]')?.click();
  flushSync();
  const validate = [
    ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ].find((item) =>
    item.textContent?.includes(translate('deployments.validate-connection')),
  );
  expect(validate).toBeDefined();
  validate?.click();
  await Promise.resolve();
  flushSync();
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

describe('deployment connection validation refreshes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      value: () => ({ cancel() {} }) as Animation,
    });
    vi.mocked(fetchDeployment).mockResolvedValue(deployment);
    Object.assign(page.params, {
      namespace: 'default',
      deployment: 'deployment',
    });
    Object.assign(page.data, {
      systemInfo: { capabilities: { serverScaledDeployments: true } },
    });
    Object.defineProperties(HTMLDialogElement.prototype, {
      close: {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.open = false;
        },
      },
      showModal: {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.open = true;
        },
      },
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
    delete (Element.prototype as { animate?: unknown }).animate;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test.each([
    [
      'a valid result',
      () => ({ valid: true }),
      translate('deployments.validate-connection-valid'),
    ],
    [
      'a handled provider validation failure',
      (onError: (error: { body: { message: string } }) => void) => {
        onError({ body: { message: 'Invalid connection' } });
        return { valid: false };
      },
      'Invalid connection',
    ],
  ])(
    'keeps the validation result visible across refreshes after %s',
    async (_, validate, result) => {
      vi.mocked(
        validateCurrentWorkerDeploymentVersionComputeConfig,
      ).mockImplementation(async (_, onError) => validate(onError as never));
      const { component } = await renderDeployment();

      await clickValidateConnection();
      await vi.advanceTimersByTimeAsync(0);
      flushSync();
      expect(
        validateCurrentWorkerDeploymentVersionComputeConfig,
      ).toHaveBeenCalledOnce();
      const modal = document.querySelector<HTMLDialogElement>(
        '#validate-connection-modal-build-id',
      );
      expect(modal?.open).toBe(true);
      expect(document.body.textContent).toContain(result);

      await vi.advanceTimersByTimeAsync(3_000);
      flushSync();

      expect(fetchDeployment).toHaveBeenCalledTimes(4);
      expect(modal?.open).toBe(true);
      expect(document.body.textContent).toContain(result);
      unmount(component);
    },
  );

  test('keeps refreshing through the parent after the immediate refresh replaces row data', async () => {
    vi.useFakeTimers();
    const route = { key: 'default\u0000deployment' };
    let state = {};
    const apply = vi.fn((result) => {
      state = updateDeploymentRefreshState(state, result);
    });
    const refresh = createLatestDeploymentRefresher(
      async () => ({ version: 'refreshed' }),
      () => route,
      apply,
    );

    scheduleConnectionStatusRefreshes(() => void refresh(), []);
    await vi.advanceTimersByTimeAsync(0);
    expect(state).toEqual({
      deployment: { key: route, deployment: { version: 'refreshed' } },
    });

    await vi.advanceTimersByTimeAsync(3_000);
    expect(apply).toHaveBeenCalledTimes(3);
  });

  test('cancels a replaced validation refresh sequence before scheduling another', () => {
    vi.useFakeTimers();
    const reload = vi.fn();
    const refreshes = scheduleConnectionStatusRefreshes(reload, []);

    scheduleConnectionStatusRefreshes(reload, refreshes);
    vi.advanceTimersByTime(3_000);

    expect(reload).toHaveBeenCalledTimes(4);
  });

  test('applies a refresh only after its pending request resolves', async () => {
    const result = deferred<string>();
    const apply = vi.fn();
    const refresh = createLatestDeploymentRefresher(
      () => result.promise,
      () => 'deployment',
      apply,
    );

    const pendingRefresh = refresh();
    expect(apply).not.toHaveBeenCalled();

    result.resolve('fresh');
    await pendingRefresh;
    expect(apply).toHaveBeenCalledWith({
      key: 'deployment',
      deployment: 'fresh',
    });
  });

  test('keeps the initial deployment visible when a refresh fails', async () => {
    const refreshError = new Error('refresh failed');
    let state = {};
    const refresh = createLatestDeploymentRefresher(
      async () => {
        throw refreshError;
      },
      () => 'deployment',
      (result) => (state = updateDeploymentRefreshState(state, result)),
    );

    await refresh();

    expect(state).toEqual({
      error: { key: 'deployment', error: refreshError },
    });
    expect(
      (state as { deployment?: { deployment: string } }).deployment
        ?.deployment ?? 'initial',
    ).toBe('initial');
  });

  test('ignores an older refresh result after a newer request has completed', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const apply = vi.fn();
    const refresh = createLatestDeploymentRefresher(
      vi
        .fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise),
      () => 'deployment',
      apply,
    );

    const firstRefresh = refresh();
    const secondRefresh = refresh();
    second.resolve('newer');
    await secondRefresh;
    first.resolve('older');
    await firstRefresh;

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith({
      key: 'deployment',
      deployment: 'newer',
    });
  });

  test('ignores a refresh result after navigating to another deployment', async () => {
    const result = deferred<string>();
    const apply = vi.fn();
    let route = 'first';
    const refresh = createLatestDeploymentRefresher(
      () => result.promise,
      () => route,
      apply,
    );

    const pendingRefresh = refresh();
    route = 'second';
    result.resolve('stale');
    await pendingRefresh;

    expect(apply).not.toHaveBeenCalled();
  });

  test('uses deployment-route identity to reject stale results after A to B to A navigation', async () => {
    const firstA = { key: 'A' };
    const b = { key: 'B' };
    const secondA = { key: 'A' };
    const firstAResult = deferred<string>();
    const bResult = deferred<string>();
    const secondAResult = deferred<string>();
    const apply = vi.fn();
    let route = firstA;
    const refresh = createLatestDeploymentRefresher(
      vi
        .fn()
        .mockReturnValueOnce(firstAResult.promise)
        .mockReturnValueOnce(bResult.promise)
        .mockReturnValueOnce(secondAResult.promise),
      () => route,
      apply,
    );

    const firstARefresh = refresh();
    route = b;
    const bRefresh = refresh();
    route = secondA;
    const secondARefresh = refresh();
    firstAResult.resolve('stale A');
    bResult.resolve('stale B');
    secondAResult.resolve('fresh A');
    await Promise.all([firstARefresh, bRefresh, secondARefresh]);

    expect(apply).toHaveBeenCalledOnce();
    expect(apply).toHaveBeenCalledWith({ key: secondA, deployment: 'fresh A' });
  });

  test('does not render a previously applied A result after returning to A', () => {
    const firstA = { instance: Symbol('first A') };
    const secondA = { instance: Symbol('second A') };
    const state = updateDeploymentRefreshState(
      {},
      { key: firstA, deployment: 'stale A' },
    );

    expect(isCurrentDeploymentRoute(state.deployment!.key, secondA)).toBe(
      false,
    );
  });

  test('retains the last successful deployment while recording a later refresh error', () => {
    const fresh = updateDeploymentRefreshState(
      {},
      { key: 'deployment', deployment: 'fresh' },
    );
    const error = new Error('refresh failed');

    expect(
      updateDeploymentRefreshState(fresh, { key: 'deployment', error }),
    ).toEqual({
      deployment: { key: 'deployment', deployment: 'fresh' },
      error: { key: 'deployment', error },
    });
  });
});
