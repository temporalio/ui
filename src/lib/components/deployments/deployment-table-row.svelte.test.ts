import { msNumberToTs } from '@temporalio/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import type { ComputeStatus } from '$lib/types/deployments';

import {
  closeDeploymentClientTestRunner,
  getDeploymentClientTestRunner,
  VITE_SERVER_BOOT_TIMEOUT_MS,
} from './deployment-client-test-runner';

const computeStatuses: Record<string, ComputeStatus> = {
  Pending: { providerValidation: {} },
  Connected: {
    providerValidation: { lastCheckTime: msNumberToTs(1_000) },
  },
  Failed: {
    providerValidation: {
      lastCheckTime: msNumberToTs(1_000),
      errorMessage: 'Connection failed',
    },
  },
};

describe('deployment list connection status visibility', () => {
  let client: Awaited<ReturnType<typeof getDeploymentClientTestRunner>>;

  beforeAll(async () => {
    client = await getDeploymentClientTestRunner();
  }, VITE_SERVER_BOOT_TIMEOUT_MS);

  beforeEach(() => {
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

  afterEach(async () => {
    await client.cleanup();
    vi.unstubAllGlobals();
  });

  afterAll(closeDeploymentClientTestRunner);

  test('keeps providers visible while hiding statuses by default and restores statuses when enabled', async () => {
    const hidden = client.renderRows({ computeStatuses });

    expect(hidden.textContent?.match(/Lambda/g)).toHaveLength(3);
    for (const status of Object.keys(computeStatuses)) {
      expect(hidden.textContent).not.toContain(status);
    }

    await client.cleanup();

    const visible = client.renderRows({
      computeStatuses,
      showConnectionStatus: true,
    });

    expect(visible.textContent?.match(/Lambda/g)).toHaveLength(3);
    for (const status of Object.keys(computeStatuses)) {
      expect(visible.textContent).toContain(status);
    }
  });
});
