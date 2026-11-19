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

import {
  closeDeploymentClientTestRunner,
  getDeploymentClientTestRunner,
  VITE_SERVER_BOOT_TIMEOUT_MS,
} from './deployment-client-test-runner';

/**
 * The region badge sits several components below whatever is handed the
 * regions, on two different pages. Rendering it directly with props proves
 * the component and proves nothing about the wiring.
 *
 * These tests mount the real page and the real row and read what a person
 * would see, so a prop dropped anywhere in either chain fails them.
 */

const EAST = 'aws-us-east-1';
const WEST = 'aws-us-west-2';

const BOTH_REGIONS = [
  { regionId: EAST, role: 'primary' as const },
  { regionId: WEST, role: 'replica' as const },
];

const lambda = { provider: { type: 'aws-lambda' } };

const deploymentResponse = {
  conflictToken: 'token',
  workerDeploymentInfo: {
    name: 'deployment',
    routingConfig: {},
    versionSummaries: [
      {
        version: 'deployment.current',
        deploymentVersion: { deploymentName: 'deployment', buildId: 'current' },
        createTime: msNumberToTs(1_000),
        computeConfig: {
          scalingGroups: { east: { ...lambda, regionIds: [EAST] } },
        },
      },
    ],
  },
};

const versionResponse = (scalingGroups: Record<string, unknown>) => ({
  workerDeploymentVersionInfo: {
    version: 'deployment.current',
    deploymentVersion: { deploymentName: 'deployment', buildId: 'current' },
    computeConfig: { scalingGroups },
  },
});

describe('multi-region wiring', () => {
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

  const renderPage = async (namespaceRegions?: typeof BOTH_REGIONS) =>
    client.renderDeployment({
      fetchDeployment: deploymentResponse,
      fetchDeploymentVersion: versionResponse({
        east: { ...lambda, regionIds: [EAST] },
      }),
      ...(namespaceRegions === undefined ? {} : { namespaceRegions }),
    });

  describe('the Version row', () => {
    test('reach the regions the page was given', async () => {
      const details = await renderPage(BOTH_REGIONS);

      expect(details.innerHTML).toContain('data-region-role="primary"');
      expect(details.innerHTML).toContain('data-region-role="replica"');
      expect(details.textContent).toContain('us-east-1');
      expect(details.textContent).toContain('us-west-2');
    });

    test('show the region nothing serves', async () => {
      // The whole reason the display exists: a failover to us-west-2 finds no
      // workers, and only one scaling group names a region.
      const details = await renderPage(BOTH_REGIONS);

      expect(details.innerHTML).toContain('data-region-match="none"');
    });

    test('stay dark when the page is given no regions', async () => {
      const details = await renderPage();

      expect(details.innerHTML).not.toContain('data-region-role');
    });

    test('stay dark for a single-region Namespace', async () => {
      const details = await renderPage([
        { regionId: EAST, role: 'primary' as const },
      ]);

      expect(details.innerHTML).not.toContain('data-region-role');
    });
  });

  describe('the deployments list', () => {
    test('reaches the regions the row was given', () => {
      const rows = client.renderRows({
        computeStatuses: { Pending: { providerValidation: {} } },
        namespaceRegions: BOTH_REGIONS,
      });

      expect(rows.textContent).toContain('us-east-1');
      expect(rows.textContent).toContain('us-west-2');
    });

    test('flags the region nothing serves', () => {
      const rows = client.renderRows({
        computeStatuses: { Pending: { providerValidation: {} } },
        namespaceRegions: BOTH_REGIONS,
        scalingGroups: { east: { ...lambda, regionIds: [EAST] } },
      });

      expect(rows.innerHTML).toContain('data-region-match="none"');
    });

    test('stays dark when the row is given no regions', () => {
      const rows = client.renderRows({
        computeStatuses: { Pending: { providerValidation: {} } },
      });

      expect(rows.innerHTML).not.toContain('data-region-match');
    });
  });

  describe('the per-region compute form', () => {
    const PRIMARY_ARN = 'arn:aws:lambda:us-east-1:123456789012:function:worker';
    const regionsFor = (provider: 'lambda' | 'cloud-run') => [
      {
        id: EAST,
        role: 'primary' as const,
        providerRegion: 'us-east-1',
        provider,
      },
      {
        id: WEST,
        role: 'replica' as const,
        providerRegion: 'us-west-2' as string | undefined,
        provider,
      },
    ];
    const lambdaPrimary = {
      provider: 'lambda' as const,
      lambdaArn: PRIMARY_ARN,
      iamRoleArn: '',
      roleExternalId: '',
    };
    const replicaToggle = (form: HTMLElement) =>
      form.querySelector<HTMLInputElement>('#replica-compute');
    const savedRegionIds = () =>
      client.savedRegionValues().map(({ regionId }) => regionId);

    test('a new Lambda Version saves a replica with a suggested ARN', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('lambda'),
        initialPrimary: lambdaPrimary,
      });

      expect(replicaToggle(form)?.checked).toBe(true);
      expect(savedRegionIds()).toEqual([EAST, WEST]);
      expect(client.savedRegionValues()[1]?.values.lambdaArn).toBe(
        'arn:aws:lambda:us-west-2:123456789012:function:worker',
      );
    });

    test('a suggested replica ARN asks the user to check it', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('lambda'),
        initialPrimary: lambdaPrimary,
      });

      expect(form.textContent).toContain('Check this function in us-west-2');
      expect(form.textContent).toContain(
        'Ensure the function exists in us-west-2 before you save.',
      );
    });

    test('a saved replica ARN is not called a suggestion', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('lambda'),
        enabledRegionIds: [WEST],
        initialPrimary: lambdaPrimary,
        initialReplica: {
          ...lambdaPrimary,
          lambdaArn: 'arn:aws:lambda:us-west-2:123456789012:function:other',
        },
      });

      expect(form.textContent).not.toContain('Check this function');
    });

    test('a new Cloud Run Version saves only the primary', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('cloud-run'),
      });

      expect(replicaToggle(form)?.checked).toBe(false);
      expect(savedRegionIds()).toEqual([EAST]);
    });

    test('a new Version saves only the primary when the replica has no provider region', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('lambda').map((region) =>
          region.role === 'replica'
            ? { ...region, providerRegion: undefined }
            : region,
        ),
        initialPrimary: lambdaPrimary,
      });

      expect(replicaToggle(form)?.checked).toBe(false);
      expect(savedRegionIds()).toEqual([EAST]);
    });

    test('a saved Version with no replica group keeps the replica off', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('lambda'),
        enabledRegionIds: [],
        initialPrimary: lambdaPrimary,
      });

      expect(replicaToggle(form)?.checked).toBe(false);
      expect(savedRegionIds()).toEqual([EAST]);
    });

    test('a saved Cloud Run Version with a replica group keeps the replica on', () => {
      const form = client.renderComputePerRegion({
        regions: regionsFor('cloud-run'),
        enabledRegionIds: [WEST],
      });

      expect(replicaToggle(form)?.checked).toBe(true);
      expect(savedRegionIds()).toEqual([EAST, WEST]);
    });
  });
});
