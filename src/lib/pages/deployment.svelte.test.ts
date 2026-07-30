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
} from '$lib/components/deployments/deployment-client-test-runner';
import type { WorkerDeploymentResponse } from '$lib/types/deployments';

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

describe('deployment connection status visibility', () => {
  let client: Awaited<ReturnType<typeof getDeploymentClientTestRunner>>;

  beforeAll(async () => {
    client = await getDeploymentClientTestRunner();
  });

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
});
