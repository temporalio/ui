import { msNumberToTs } from '@temporalio/common';
import i18next from 'i18next';
import { flushSync, mount, unmount } from 'svelte';

import { page } from '$app/state';

import ComputeProviderPerRegion from '$lib/components/workers/serverless-worker-form/compute-provider-per-region.svelte';
import type { ComputeRegion } from '$lib/components/workers/serverless-worker-form/multi-region';
import type {
  ComputeInitialValues,
  RegionComputeValues,
} from '$lib/components/workers/serverless-worker-form/shared';
import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';
import Deployment from '$lib/pages/deployment.svelte';
import ServerlessWorkerCreate from '$lib/pages/serverless-worker-create.svelte';
import WorkerDeploymentVersionCreate from '$lib/pages/worker-deployment-version-create.svelte';
import WorkerDeploymentVersionEdit from '$lib/pages/worker-deployment-version-edit.svelte';
import type {
  ComputeConfig,
  ComputeStatus,
  ListWorkerDeployment,
} from '$lib/types/deployments';
import type { ComputeProviderConfig } from '$lib/utilities/compute-provider-config';
import type { NamespaceRegion } from '$lib/utilities/compute-regions';

import { resetDeploymentsServiceMock } from './deployments-service-client-test-double';

import DeploymentTableRow from './deployment-table-row.svelte';

const mounted: ReturnType<typeof mount>[] = [];

export async function initialize() {
  await i18next.init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: i18nNamespaces,
    defaultNS: 'common',
    resources,
  });
}

function setPageState() {
  Object.assign(page.params, {
    namespace: 'default',
    deployment: 'deployment',
  });
  Object.assign(page.data, {
    systemInfo: { capabilities: { serverScaledDeployments: true } },
  });
}

export async function cleanup() {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
}

export async function renderDeployment({
  fetchDeployment,
  fetchDeploymentVersion,
  showConnectionStatus,
  namespaceRegions,
}: {
  fetchDeployment: unknown;
  fetchDeploymentVersion: unknown;
  showConnectionStatus?: boolean;
  namespaceRegions?: NamespaceRegion[];
}) {
  setPageState();
  resetDeploymentsServiceMock({ fetchDeployment, fetchDeploymentVersion });

  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(Deployment, {
      target,
      props: {
        ...(showConnectionStatus === undefined ? {} : { showConnectionStatus }),
        ...(namespaceRegions === undefined
          ? {}
          : { providerConfig: { regions: namespaceRegions } }),
      },
    }),
  );
  await Promise.resolve();
  await Promise.resolve();
  flushSync();
  return target;
}

export function expandDetails(target: HTMLElement) {
  const expand = target.querySelector<HTMLButtonElement>(
    'button[aria-label="Expand"]',
  );
  expand?.click();
  flushSync();
  return target.querySelector<HTMLTableCellElement>(
    'tr.bg-surface-primary > td[colspan]',
  );
}

export function openMenu(controls: string) {
  const trigger = document.querySelector<HTMLButtonElement>(
    `[aria-controls="${controls}"]`,
  );
  trigger?.click();
  flushSync();
  return document.getElementById(controls);
}

export function renderRows({
  computeStatuses,
  showConnectionStatus,
  namespaceRegions,
  scalingGroups,
}: {
  computeStatuses: Record<string, ComputeStatus>;
  showConnectionStatus?: boolean;
  namespaceRegions?: NamespaceRegion[];
  scalingGroups?: ComputeConfig['scalingGroups'];
}) {
  setPageState();
  const table = document.body.appendChild(document.createElement('table'));
  const target = table.appendChild(document.createElement('tbody'));

  for (const [status, computeStatus] of Object.entries(computeStatuses)) {
    mounted.push(
      mount(DeploymentTableRow, {
        target,
        props: {
          deployment: deployment(
            status.toLowerCase(),
            computeStatus,
            scalingGroups,
          ),
          columns: [{ label: 'Current Version' }],
          ...(showConnectionStatus === undefined
            ? {}
            : { showConnectionStatus }),
          ...(namespaceRegions === undefined ? {} : { namespaceRegions }),
        },
      }),
    );
  }
  flushSync();
  return target;
}

const COMPUTE_PAGES = {
  'create-deployment': ServerlessWorkerCreate,
  'create-version': WorkerDeploymentVersionCreate,
  'edit-version': WorkerDeploymentVersionEdit,
};

export type ComputePage = keyof typeof COMPUTE_PAGES;

/** Mounts a page with a compute form, after its fetches settle. */
export async function renderComputePage({
  page: pageName,
  providerConfig,
  fetchDeployment,
  fetchDeploymentVersion,
}: {
  page: ComputePage;
  providerConfig: ComputeProviderConfig;
  fetchDeployment?: unknown;
  fetchDeploymentVersion?: unknown;
}) {
  setPageState();
  resetDeploymentsServiceMock({ fetchDeployment, fetchDeploymentVersion });
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(COMPUTE_PAGES[pageName], {
      target,
      props: {
        namespace: 'default',
        deployment: 'deployment',
        buildId: 'current',
        onSuccess: () => {},
        providerConfig,
      },
    }),
  );
  for (let turn = 0; turn < 5; turn++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    flushSync();
  }
  return target;
}

let computeRegionValues: RegionComputeValues[] = [];

/** What the per-region form last bound to `regionValues`, as a save sends. */
export function savedRegionValues() {
  flushSync();
  return computeRegionValues;
}

export function renderComputePerRegion({
  regions,
  enabledRegionIds,
  initialPrimary,
}: {
  regions: ComputeRegion[];
  enabledRegionIds?: string[];
  initialPrimary?: ComputeInitialValues;
}) {
  setPageState();
  computeRegionValues = [];
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(ComputeProviderPerRegion, {
      target,
      props: {
        namespace: 'default',
        regions,
        ...(enabledRegionIds === undefined ? {} : { enabledRegionIds }),
        ...(initialPrimary === undefined ? {} : { initialPrimary }),
        get regionValues() {
          return computeRegionValues;
        },
        set regionValues(value: RegionComputeValues[]) {
          computeRegionValues = value;
        },
      },
    }),
  );
  flushSync();
  return target;
}

function deployment(
  name: string,
  computeStatus: ComputeStatus,
  scalingGroups: ComputeConfig['scalingGroups'] = {
    default: { provider: { type: 'aws-lambda' } },
  },
): ListWorkerDeployment {
  return {
    name,
    createTime: msNumberToTs(1_000),
    routingConfig: {},
    currentVersionSummary: {
      version: `${name}.current`,
      deploymentVersion: { deploymentName: name, buildId: 'current' },
      createTime: msNumberToTs(1_000),
      computeConfig: { scalingGroups },
      computeStatus,
    },
  };
}
