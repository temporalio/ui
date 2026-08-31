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

import {
  closeDeploymentClientTestRunner,
  getDeploymentClientTestRunner,
  VITE_SERVER_BOOT_TIMEOUT_MS,
} from '$lib/components/deployments/deployment-client-test-runner';
import type { DescribeWorkerDeploymentResponse } from '$lib/types/deployments';

const deployment = {
  conflictToken: 'token',
  workerDeploymentInfo: {
    name: 'deployment',
    createTime: '',
    routingConfig: {
      currentDeploymentVersion: {
        deploymentName: 'deployment',
        buildId: 'build-id',
      },
    },
    lastModifierIdentity: 'test',
    versionSummaries: [
      {
        version: 'deployment.build-id',
        createTime: '',
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
            lastCheckTime: '2026-08-04T18:54:10.136859273Z',
          },
        },
      },
    ],
  },
} satisfies DescribeWorkerDeploymentResponse;

const selfHostedDeployment = {
  conflictToken: 'token',
  workerDeploymentInfo: {
    name: 'deployment',
    createTime: '',
    routingConfig: {
      currentDeploymentVersion: {
        deploymentName: 'deployment',
        buildId: 'build-id',
      },
    },
    lastModifierIdentity: 'test',
    versionSummaries: [
      {
        version: 'deployment.build-id',
        createTime: '',
        deploymentVersion: {
          deploymentName: 'deployment',
          buildId: 'build-id',
        },
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
        computeStatus: {
          providerValidation: {
            lastCheckTime: '2026-08-04T18:54:10.136859273Z',
          },
        },
      },
      {
        version: 'deployment.build-id-2',
        createTime: '',
        deploymentVersion: {
          deploymentName: 'deployment',
          buildId: 'build-id-2',
        },
        status: 'WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE',
        computeConfig: { scalingGroups: {} },
      },
    ],
  },
} satisfies DescribeWorkerDeploymentResponse;

function menuItems(menu: Element | null) {
  return Array.from(menu?.querySelectorAll('[role="menuitem"]') ?? []).map(
    (item) => item.textContent?.trim(),
  );
}

describe('deployment connection status visibility', () => {
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
  });

  afterEach(async () => {
    await client.cleanup();
    delete (Element.prototype as { animate?: unknown }).animate;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  afterAll(closeDeploymentClientTestRunner);

  test('hides the connection header and cell by default', async () => {
    const target = await client.renderDeployment({
      fetchDeployment: deployment,
      fetchDeploymentVersion: { workerDeploymentVersionInfo: {} },
      showConnectionStatus: false,
    });

    expect(target.querySelector('th:nth-child(4)')?.textContent).toBe(
      'Deployed At',
    );
    expect(target.textContent).not.toContain('Connected');
    const details = client.expandDetails(target);
    expect(details).not.toBeNull();
    expect(details?.getAttribute('colspan')).toBe('5');
  });

  test('renders the matching connection header and cell when enabled', async () => {
    const target = await client.renderDeployment({
      fetchDeployment: deployment,
      fetchDeploymentVersion: { workerDeploymentVersionInfo: {} },
      showConnectionStatus: true,
    });

    expect(target.querySelector('th:nth-child(4)')?.textContent).toBe(
      'Connection',
    );
    expect(target.textContent).toContain('Connected');
    const details = client.expandDetails(target);
    expect(details).not.toBeNull();
    expect(details?.getAttribute('colspan')).toBe('6');
  });

  test('shows compute-only deployment and version actions for deployments with compute config', async () => {
    const target = await client.renderDeployment({
      fetchDeployment: deployment,
      fetchDeploymentVersion: { workerDeploymentVersionInfo: {} },
      showConnectionStatus: false,
    });

    expect(target.textContent).toContain('Create New Version');
    expect(client.openMenu('deployment-header-actions')?.textContent).toContain(
      'Ramp to Unversioned Workers',
    );

    const versionMenu = client.openMenu('version-actions-build-id');
    expect(menuItems(versionMenu)).toEqual([
      'Edit',
      'Unset Current',
      'Set Ramping Version',
      'Validate Connection',
      'View Workflows',
      'Delete',
    ]);
  });

  test('hides compute-only actions but retains routing actions for self-hosted deployments', async () => {
    const target = await client.renderDeployment({
      fetchDeployment: selfHostedDeployment,
      fetchDeploymentVersion: { workerDeploymentVersionInfo: {} },
      showConnectionStatus: false,
    });

    expect(target.textContent).not.toContain('Create New Version');
    const headerMenu = client.openMenu('deployment-header-actions');
    expect(headerMenu?.textContent).not.toContain(
      'Ramp to Unversioned Workers',
    );

    const versionMenu = client.openMenu('version-actions-build-id');
    expect(menuItems(versionMenu)).toEqual([
      'Unset Current',
      'Set Ramping Version',
      'View Workflows',
      'Delete',
    ]);

    const inactiveVersionMenu = client.openMenu('version-actions-build-id-2');
    expect(menuItems(inactiveVersionMenu)).toEqual([
      'Set Current Version',
      'Set Ramping Version',
      'View Workflows',
      'Delete',
    ]);
  });
});
