import { msNumberToTs } from '@temporalio/common';
import i18next from 'i18next';
import { flushSync, mount, unmount } from 'svelte';

import { page } from '$app/state';

import { i18nNamespaces } from '$lib/i18n';
import resources from '$lib/i18n/locales';
import Deployment from '$lib/pages/deployment.svelte';
import type {
  ComputeStatus,
  WorkerDeploymentSummary,
} from '$lib/types/deployments';

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
}: {
  fetchDeployment: unknown;
  fetchDeploymentVersion: unknown;
  showConnectionStatus: boolean;
}) {
  setPageState();
  resetDeploymentsServiceMock({ fetchDeployment, fetchDeploymentVersion });

  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(Deployment, {
      target,
      props: { showConnectionStatus },
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
    'tr.surface-primary > td[colspan]',
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
  showConnectionStatus = false,
}: {
  computeStatuses: Record<string, ComputeStatus>;
  showConnectionStatus?: boolean;
}) {
  setPageState();
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

function deployment(
  name: string,
  computeStatus: ComputeStatus,
): WorkerDeploymentSummary {
  return {
    name,
    createTime: msNumberToTs(1_000),
    routingConfig: {},
    currentVersionSummary: {
      version: `${name}.current`,
      deploymentVersion: { deploymentName: name, buildId: 'current' },
      createTime: msNumberToTs(1_000),
      computeConfig: {
        scalingGroups: { default: { provider: { type: 'aws-lambda' } } },
      },
      computeStatus,
    },
  };
}
