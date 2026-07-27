import type { Timestamp } from '@temporalio/common';
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { page } from '$app/state';

import type {
  ComputeStatus,
  WorkerDeploymentSummary,
} from '$lib/types/deployments';

import DeploymentTableRow from './deployment-table-row.svelte';

const mounted: ReturnType<typeof mount>[] = [];
const timestamp = { seconds: 1, nanos: 0 } as unknown as Timestamp;

const computeStatuses: Record<string, ComputeStatus> = {
  Pending: { providerValidation: {} },
  Connected: {
    providerValidation: { lastCheckTime: timestamp },
  },
  Failed: {
    providerValidation: {
      lastCheckTime: timestamp,
      errorMessage: 'Connection failed',
    },
  },
};

function deployment(
  name: string,
  computeStatus: ComputeStatus,
): WorkerDeploymentSummary {
  return {
    name,
    createTime: timestamp,
    routingConfig: {},
    currentVersionSummary: {
      version: `${name}.current`,
      deploymentVersion: { deploymentName: name, buildId: 'current' },
      createTime: timestamp,
      computeConfig: {
        scalingGroups: { default: { provider: { type: 'aws-lambda' } } },
      },
      computeStatus,
    },
  };
}

function renderRows(showConnectionStatus = false) {
  const table = document.body.appendChild(document.createElement('table'));
  const target = table.appendChild(document.createElement('tbody'));

  for (const [status, computeStatus] of Object.entries(computeStatuses)) {
    mounted.push(
      mount(DeploymentTableRow, {
        target,
        props: {
          deployment: deployment(status.toLowerCase(), computeStatus),
          columns: [{ label: 'Current Version' }],
          showConnectionStatus,
        },
      }),
    );
  }
  flushSync();
  return target;
}

describe('deployment list connection status visibility', () => {
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
    Object.assign(page.params, { namespace: 'default' });
    Object.assign(page.data, {
      systemInfo: { capabilities: { serverScaledDeployments: true } },
    });
  });

  afterEach(async () => {
    await Promise.all(mounted.splice(0).map((component) => unmount(component)));
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  test('keeps providers visible while hiding statuses by default and restores statuses when enabled', async () => {
    const hidden = renderRows();

    expect(hidden.textContent?.match(/Lambda/g)).toHaveLength(3);
    for (const status of Object.keys(computeStatuses)) {
      expect(hidden.textContent).not.toContain(status);
    }

    await Promise.all(mounted.splice(0).map((component) => unmount(component)));
    document.body.replaceChildren();

    const visible = renderRows(true);

    expect(visible.textContent?.match(/Lambda/g)).toHaveLength(3);
    for (const status of Object.keys(computeStatuses)) {
      expect(visible.textContent).toContain(status);
    }
  });
});
