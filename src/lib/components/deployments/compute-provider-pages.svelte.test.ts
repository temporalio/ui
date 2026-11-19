import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import {
  closeDeploymentClientTestRunner,
  getDeploymentClientTestRunner,
  VITE_SERVER_BOOT_TIMEOUT_MS,
} from './deployment-client-test-runner';

/**
 * Every provider, in every Namespace shape, on every page with a compute
 * form. A provider added or a page changed without the others drifts here
 * first.
 *
 * The providers mirror what Temporal Cloud offers: the providers of the
 * Namespace's cloud, with the other cloud's hidden.
 */

type Provider = 'lambda' | 'agentcore' | 'cloud-run';
type Topology = 'none' | 'single' | 'ha';
type Layout = 'primary' | 'replica' | 'both';

const PROVIDERS: Provider[] = ['lambda', 'agentcore', 'cloud-run'];
const TOPOLOGIES: Topology[] = ['none', 'single', 'ha'];

const LABEL: Record<Provider, string> = {
  lambda: 'AWS Lambda',
  agentcore: 'Amazon Bedrock AgentCore',
  'cloud-run': 'Google Cloud Run',
};
const BADGE: Record<Provider, string> = {
  lambda: 'Lambda',
  agentcore: 'AgentCore',
  'cloud-run': 'Cloud Run',
};
const RESOURCE_FIELD: Record<Provider, string> = {
  lambda: 'lambdaArn',
  agentcore: 'agentCoreEndpointArn',
  'cloud-run': 'gcpWorkerPool',
};
const CLOUD: Record<Provider, 'aws' | 'gcp'> = {
  lambda: 'aws',
  agentcore: 'aws',
  'cloud-run': 'gcp',
};
const REGIONS = {
  aws: { primary: 'us-east-1', replica: 'us-west-2' },
  gcp: { primary: 'us-central1', replica: 'us-west1' },
};

const regionId = (provider: Provider, role: 'primary' | 'replica') =>
  `${CLOUD[provider]}-${REGIONS[CLOUD[provider]][role]}`;

const providerConfig = (provider: Provider, topology: Topology) => {
  const cloud = REGIONS[CLOUD[provider]];
  const primary = {
    regionId: regionId(provider, 'primary'),
    role: 'primary' as const,
    providerRegion: cloud.primary,
  };
  const replica = {
    regionId: regionId(provider, 'replica'),
    role: 'replica' as const,
    providerRegion: cloud.replica,
  };
  return {
    providers: PROVIDERS.map((value) =>
      CLOUD[value] === CLOUD[provider] ? { value } : { value, hidden: true },
    ),
    regions:
      topology === 'none'
        ? undefined
        : topology === 'single'
          ? [primary]
          : [primary, replica],
  };
};

/** The resource a group saves in a provider region. */
const resource = (provider: Provider, region: string): string => {
  if (provider === 'lambda')
    return `arn:aws:lambda:${region}:123456789012:function:worker`;
  if (provider === 'agentcore')
    return `arn:aws:bedrock-agentcore:${region}:123456789012:runtime/worker/runtime-endpoint/DEFAULT`;
  return `pool-${region}`;
};

const groupDetails = (provider: Provider, region: string) => {
  const role = 'arn:aws:iam::123456789012:role/invoke';
  if (provider === 'lambda')
    return {
      type: 'aws-lambda',
      data: { arn: resource(provider, region), role },
    };
  if (provider === 'agentcore')
    return {
      type: 'aws-agentcore',
      data: { endpoint_arn: resource(provider, region), role },
    };
  return {
    type: 'gcp-cloud-run',
    data: {
      project: 'project',
      region,
      worker_pool: resource(provider, region),
      service_account: 'worker@project.iam.gserviceaccount.com',
    },
  };
};

const group = (
  provider: Provider,
  region: string,
  regionIds: string[] = [],
) => {
  const { type, data } = groupDetails(provider, region);
  return {
    regionIds,
    provider: {
      type,
      details: {
        metadata: { encoding: btoa('json/plain') },
        data: btoa(JSON.stringify(data)),
      },
    },
  };
};

const computeConfig = (provider: Provider, layout: Layout) => {
  const cloud = REGIONS[CLOUD[provider]];
  const replicaId = regionId(provider, 'replica');
  const scalingGroups: Record<string, ReturnType<typeof group>> = {};
  if (layout !== 'replica')
    scalingGroups.default = group(provider, cloud.primary);
  if (layout !== 'primary')
    scalingGroups[replicaId] = group(provider, cloud.replica, [replicaId]);
  return { scalingGroups };
};

const savedResources = (provider: Provider, layout: Layout): string[] => {
  const cloud = REGIONS[CLOUD[provider]];
  return [
    ...(layout !== 'replica' ? [resource(provider, cloud.primary)] : []),
    ...(layout !== 'primary' ? [resource(provider, cloud.replica)] : []),
  ];
};

const resourceInputs = (target: HTMLElement, provider: Provider) =>
  [
    ...target.querySelectorAll<HTMLInputElement>(
      `input[id$="${RESOURCE_FIELD[provider]}"]`,
    ),
  ].map((input) => input.value);

const expectOnlyProvider = (target: HTMLElement, provider: Provider) => {
  const text = target.textContent ?? '';
  expect(text).toContain(LABEL[provider]);
  for (const other of PROVIDERS.filter((value) => value !== provider)) {
    expect(text).not.toContain(LABEL[other]);
    expect(resourceInputs(target, other)).toEqual([]);
  }
};

const versionResponse = (provider: Provider, layout: Layout) => ({
  workerDeploymentVersionInfo: {
    version: 'deployment.current',
    deploymentVersion: { deploymentName: 'deployment', buildId: 'current' },
    computeConfig: computeConfig(provider, layout),
  },
});

const deploymentResponse = (provider: Provider) => ({
  workerDeploymentInfo: {
    name: 'deployment',
    routingConfig: {},
    versionSummaries: [
      {
        version: 'deployment.current',
        deploymentVersion: { deploymentName: 'deployment', buildId: 'current' },
        computeConfig: computeConfig(provider, 'primary'),
      },
    ],
  },
});

describe('compute provider pages', () => {
  let client: Awaited<ReturnType<typeof getDeploymentClientTestRunner>>;

  beforeAll(async () => {
    client = await getDeploymentClientTestRunner();
  }, VITE_SERVER_BOOT_TIMEOUT_MS);

  afterEach(async () => {
    await client.cleanup();
  });

  afterAll(async () => {
    await closeDeploymentClientTestRunner();
  });

  const cases = PROVIDERS.flatMap((provider) =>
    TOPOLOGIES.map((topology) => ({ provider, topology })),
  );

  test.each(cases)(
    'create Deployment shows only $provider ($topology)',
    async ({ provider, topology }) => {
      const target = await client.renderComputePage({
        page: 'create-deployment',
        providerConfig: {
          ...providerConfig(provider, topology),
          providers: PROVIDERS.map((value) =>
            value === provider ? { value } : { value, hidden: true },
          ),
        },
      });

      expectOnlyProvider(target, provider);
      expect(resourceInputs(target, provider).length).toBeGreaterThan(0);
    },
  );

  test.each(cases)(
    'create Version shows only $provider ($topology)',
    async ({ provider, topology }) => {
      const target = await client.renderComputePage({
        page: 'create-version',
        providerConfig: providerConfig(provider, topology),
        fetchDeployment: deploymentResponse(provider),
      });

      expectOnlyProvider(target, provider);
      expect(resourceInputs(target, provider).length).toBeGreaterThan(0);
    },
  );

  const editCases = cases.flatMap(({ provider, topology }) =>
    (topology === 'ha'
      ? (['primary', 'replica', 'both'] as const)
      : (['primary'] as const)
    ).map((layout) => ({ provider, topology, layout })),
  );

  test.each(editCases)(
    'edit Version shows only $provider and its saved values ($topology, $layout)',
    async ({ provider, topology, layout }) => {
      const target = await client.renderComputePage({
        page: 'edit-version',
        providerConfig: providerConfig(provider, topology),
        fetchDeploymentVersion: versionResponse(provider, layout),
      });

      expectOnlyProvider(target, provider);
      expect(resourceInputs(target, provider)).toEqual(
        savedResources(provider, layout),
      );
    },
  );

  test('create Deployment says so when no provider is offered', async () => {
    const target = await client.renderComputePage({
      page: 'create-deployment',
      providerConfig: {
        providers: PROVIDERS.map((value) => ({ value, hidden: true })),
      },
    });

    expect(target.textContent).toContain(
      'No compute provider is available for this Namespace.',
    );
    for (const provider of PROVIDERS) {
      expect(resourceInputs(target, provider)).toEqual([]);
    }
  });

  test('edit Version says so when the saved provider is unknown', async () => {
    const target = await client.renderComputePage({
      page: 'edit-version',
      providerConfig: providerConfig('lambda', 'none'),
      fetchDeploymentVersion: {
        workerDeploymentVersionInfo: {
          computeConfig: {
            scalingGroups: { default: { provider: { type: 'other-cloud' } } },
          },
        },
      },
    });

    expect(target.textContent).toContain(
      'This Version uses a compute provider that this page cannot show.',
    );
    for (const provider of PROVIDERS) {
      expect(target.textContent).not.toContain(LABEL[provider]);
      expect(resourceInputs(target, provider)).toEqual([]);
    }
  });

  test.each(editCases)(
    'the Deployments row badge names only $provider ($topology, $layout)',
    ({ provider, topology, layout }) => {
      const rows = client.renderRows({
        computeStatuses: { Pending: { providerValidation: {} } },
        namespaceRegions: providerConfig(provider, topology).regions,
        scalingGroups: computeConfig(provider, layout).scalingGroups,
      });

      const text = rows.textContent ?? '';
      expect(text).toContain(BADGE[provider]);
      for (const other of PROVIDERS.filter((value) => value !== provider)) {
        expect(text).not.toContain(BADGE[other]);
      }
    },
  );
});
