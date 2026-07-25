import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { page } from '$app/state';

import {
  fetchDeployment,
  fetchDeploymentVersion,
} from '$lib/services/deployments-service';
import type { WorkerDeploymentResponse } from '$lib/types/deployments';

import Deployment from './deployment.svelte';

vi.mock('$lib/services/deployments-service', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('$lib/services/deployments-service')
  >()),
  fetchDeployment: vi.fn(),
  fetchDeploymentVersion: vi.fn(),
}));

const deployment = {
  conflictToken: 'token',
  workerDeploymentInfo: {
    name: 'deployment',
    routingConfig: {
      currentDeploymentVersion: {
        deploymentName: 'deployment',
        buildId: 'build-id',
      },
    },
    currentVersionSummary: {
      version: 'deployment.build-id',
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
        computeConfig: {
          scalingGroups: { default: { providerType: 'aws-lambda' } },
        },
        computeStatus: {
          providerValidation: {
            lastCheckTime: { seconds: 1, nanos: 0 },
          },
        },
      },
    ],
  },
} as unknown as WorkerDeploymentResponse;

const mounted: ReturnType<typeof mount>[] = [];

async function renderDeployment(showConnectionStatus: boolean) {
  const target = document.body.appendChild(document.createElement('div'));
  const component = mount(Deployment, {
    target,
    props: { showConnectionStatus },
  });
  mounted.push(component);
  await Promise.resolve();
  flushSync();
  return target;
}

function expandDetails(target: HTMLElement) {
  const expand = target.querySelector<HTMLButtonElement>(
    'button[aria-label="Expand"]',
  );
  expect(expand).not.toBeNull();
  expand?.click();
  flushSync();
  return target.querySelector<HTMLTableCellElement>(
    'tr.surface-primary > td[colspan]',
  );
}

describe('deployment connection status visibility', () => {
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
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      value: () => ({ cancel() {} }) as Animation,
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
    Object.assign(page.params, {
      namespace: 'default',
      deployment: 'deployment',
    });
    Object.assign(page.data, {
      systemInfo: { capabilities: { serverScaledDeployments: true } },
    });
    vi.mocked(fetchDeployment).mockResolvedValue(deployment);
    vi.mocked(fetchDeploymentVersion).mockResolvedValue({
      workerDeploymentVersionInfo: {},
    } as Awaited<ReturnType<typeof fetchDeploymentVersion>>);
  });

  afterEach(async () => {
    await Promise.all(mounted.splice(0).map((component) => unmount(component)));
    document.body.replaceChildren();
    delete (Element.prototype as { animate?: unknown }).animate;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('hides the connection header and cell by default', async () => {
    const target = await renderDeployment(false);

    expect(target.querySelector('th:nth-child(4)')?.textContent).toBe(
      'Deployed At',
    );
    expect(target.textContent).not.toContain('Connected');
    expect(expandDetails(target)?.getAttribute('colspan')).toBe('5');
  });

  test('renders the matching connection header and cell when enabled', async () => {
    const target = await renderDeployment(true);

    expect(target.querySelector('th:nth-child(4)')?.textContent).toBe(
      'Connection',
    );
    expect(target.textContent).toContain('Connected');
    expect(expandDetails(target)?.getAttribute('colspan')).toBe('6');
  });
});
