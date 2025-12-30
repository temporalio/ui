<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowPollersWithVersions } from '$lib/runes/workflow-versions.svelte';
  import { type PollerWithTaskQueueTypes } from '$lib/services/pollers-service';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { TaskQueueResponse } from '$lib/types';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  import DeploymentStatus from './deployments/deployment-status.svelte';
  import PollerIcon from './poller-icon.svelte';
  import Timestamp from './timestamp.svelte';

  type Props = {
    workers: TaskQueueResponse;
    children?: Snippet;
  };
  let { workers, children }: Props = $props();

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const {
    pollers,
    pinned,
    autoUpgrade,
    currentBuildId,
    currentDeployment,
    rampingBuildId,
    rampingDeployment,
  } = $derived(getWorkflowPollersWithVersions(workflow, workers));

  const getPollerDeploymentName = (poller: PollerWithTaskQueueTypes) => {
    const deployment =
      poller?.deploymentOptions?.deploymentName ??
      poller?.workerVersionCapabilities?.deploymentSeriesName;
    return deployment ?? '';
  };

  const getPollerBuildId = (poller: PollerWithTaskQueueTypes) => {
    const buildId =
      poller?.deploymentOptions?.buildId ??
      poller?.workerVersionCapabilities?.buildId;
    return buildId ?? '';
  };

  const getPollerStatus = (
    poller: PollerWithTaskQueueTypes,
  ): Status | undefined => {
    return pollerHasCurrentBuildId(poller)
      ? 'Current'
      : pollerHasRampingBuildId(poller)
        ? 'Ramping'
        : undefined;
  };

  const getPollerLabel = (poller: PollerWithTaskQueueTypes) => {
    return pollerHasCurrentBuildId(poller)
      ? translate('deployments.current')
      : pollerHasRampingBuildId(poller)
        ? translate('deployments.ramping-percentage', {
            percentage: workers.versioningInfo.rampingVersionPercentage,
          })
        : '';
  };

  const pollerHasCurrentBuildId = $derived(
    (poller) =>
      getPollerDeploymentName(poller) === currentDeployment &&
      getPollerBuildId(poller) === currentBuildId,
  );

  const pollerHasRampingBuildId = $derived(
    (poller: PollerWithTaskQueueTypes) =>
      getPollerDeploymentName(poller) === rampingDeployment &&
      getPollerBuildId(poller) === rampingBuildId,
  );
</script>

<h2 class="flex items-center gap-2" data-testid="workers">
  {translate('workers.workers')}
  <Badge type="count">{pollers?.length || 0}</Badge>
</h2>
{@render children?.()}
{#if pinned}
  <p>
    {translate('workers.viewing-pinned-build-ids')}
  </p>
{:else if autoUpgrade}
  <p>
    {translate('workers.viewing-auto-upgrade-build-ids')}
  </p>
{/if}
<Table class="mb-6" fixed>
  <caption class="sr-only" slot="caption"
    >{translate('workflows.workers-tab')}</caption
  >
  <TableHeaderRow slot="headers">
    <th>{translate('common.id')}</th>
    <th>{translate('workers.buildId')}</th>
    <th>{translate('deployments.deployment')}</th>
    <th class="hidden md:table-cell">{translate('workflows.last-accessed')}</th>
    <th class="!text-center xl:w-48">
      {translate('workflows.workflow-task-handler')}
    </th>
    <th class="!text-center xl:w-36">
      {translate('workflows.activity-handler')}
    </th>
    <th class="!text-center xl:w-36">
      {translate('workflows.nexus-handler')}
    </th>
  </TableHeaderRow>
  {#each pollers as poller}
    {@const deployment = getPollerDeploymentName(poller)}
    {@const buildId = getPollerBuildId(poller)}
    {@const status = getPollerStatus(poller)}
    {@const label = getPollerLabel(poller)}
    <TableRow data-testid="worker-row">
      <td class="select-all break-all" data-testid="worker-identity">
        {poller.identity}
      </td>
      <td class="select-all break-all" data-testid="worker-build-id">
        <div class="flex items-center gap-2">
          {buildId}
          {#if status}
            <DeploymentStatus {status} {label} />
          {/if}
        </div>
      </td>
      <td class="select-all break-all" data-testid="worker-deployment">
        {#if deployment}
          <Link
            href={routeForWorkerDeployment({
              namespace,
              deployment,
            })}
          >
            {deployment}
          </Link>
        {/if}
      </td>
      <Timestamp
        as="td"
        dateTime={poller.lastAccessTime}
        class="hidden md:table-cell"
        data-testid="worker-last-access-time"
      />
      <td data-testid="workflow-poller">
        <div class="flex items-center justify-center">
          <PollerIcon
            includesTaskQueueType={poller.taskQueueTypes.includes('WORKFLOW')}
          />
        </div>
      </td>
      <td data-testid="activity-poller">
        <div class="flex items-center justify-center">
          <PollerIcon
            includesTaskQueueType={poller.taskQueueTypes.includes('ACTIVITY')}
          />
        </div>
      </td>
      <td data-testid="nexus-poller">
        <div class="flex items-center justify-center">
          <PollerIcon
            includesTaskQueueType={poller.taskQueueTypes.includes('NEXUS')}
          />
        </div>
      </td>
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan="7">
        <EmptyState title={translate('workflows.workers-empty-state')} />
      </td>
    </tr>
  {/each}
</Table>
