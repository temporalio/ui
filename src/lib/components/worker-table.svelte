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
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { TaskQueueResponse } from '$lib/types';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  import DeploymentStatus from './deployments/deployment-status.svelte';
  import PollerIcon from './poller-icon.svelte';

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
<Table class="mb-6 w-full min-w-[600px] table-fixed">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.workers-tab')}</caption
  >
  <TableHeaderRow slot="headers">
    <th class={'w-4/12'}>{translate('common.id')}</th>
    <th class={'w-3/12'}>{translate('workers.buildId')}</th>
    <th class={'w-3/12'}>{translate('deployments.deployment')}</th>
    <th class="hidden w-2/12 md:table-cell"
      >{translate('workflows.last-accessed')}</th
    >
    <th class="w-2/12">
      <p class="text-center">
        {translate('workflows.workflow-task-handler')}
      </p>
    </th>
    <th class="w-2/12 text-center">
      <p class="text-center">{translate('workflows.activity-handler')}</p>
    </th>
    <th class="w-2/12 text-center">
      <p class="text-center">{translate('workflows.nexus-handler')}</p>
    </th>
  </TableHeaderRow>
  {#each pollers as poller}
    {@const deployment = getPollerDeploymentName(poller)}
    {@const buildId = getPollerBuildId(poller)}
    {@const status = getPollerStatus(poller)}
    {@const label = getPollerLabel(poller)}
    <TableRow data-testid="worker-row">
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">{poller.identity}</p>
      </td>
      <td class="text-left" data-testid="worker-build-id">
        <div class="flex items-center gap-2">
          <p class="select-all break-all">
            {buildId}
          </p>
          {#if status}
            <DeploymentStatus {status} {label} />
          {/if}
        </div>
      </td>
      <td class="text-left" data-testid="worker-deployment">
        <p class="select-all break-all">
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
        </p>
      </td>
      <td
        class="hidden text-left md:table-cell"
        data-testid="worker-last-access-time"
      >
        <p class="select-all">
          {formatDate(poller.lastAccessTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      </td>
      <td data-testid="workflow-poller">
        <PollerIcon
          includesTaskQueueType={poller.taskQueueTypes.includes('WORKFLOW')}
        />
      </td>
      <td data-testid="activity-poller">
        <PollerIcon
          includesTaskQueueType={poller.taskQueueTypes.includes('ACTIVITY')}
        />
      </td>
      <td data-testid="nexus-poller">
        <PollerIcon
          includesTaskQueueType={poller.taskQueueTypes.includes('NEXUS')}
        />
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
