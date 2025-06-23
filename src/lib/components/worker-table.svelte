<script lang="ts">
  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type GetPollersResponse } from '$lib/services/pollers-service';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { VersioningBehaviorEnum } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  import PollerIcon from './poller-icon.svelte';

  type Props = {
    workers: GetPollersResponse;
  };
  let { workers }: Props = $props();

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);

  const workflowDeploymentName = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'],
  );

  const workflowDeploymentVersion = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkerDeploymentVersion'
    ],
  );

  const workflowVersioningBuildId = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ??
      getBuildIdFromVersion(workflowDeploymentVersion),
  );

  const versioningBehavior = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkflowVersioningBehavior'
    ],
  );

  const pinnedBehavior = $derived(
    versioningBehavior === VersioningBehaviorEnum.Pinned,
  );
  const autoUpgradeBehavior = $derived(
    versioningBehavior === VersioningBehaviorEnum.AutoUpgrade,
  );

  const rampingDeployment = $derived(
    workers?.versioningInfo?.rampingDeploymentVersion?.deploymentName,
  );
  const rampingBuildId = $derived(
    workers?.versioningInfo?.rampingDeploymentVersion?.buildId,
  );

  const getPollerDeploymentName = (poller) => {
    const deployment =
      poller?.deploymentOptions?.deploymentName ??
      poller?.workerVersionCapabilities?.deploymentSeriesName;
    return deployment ?? '';
  };

  const getPollerBuildId = (poller) => {
    const buildId =
      poller?.deploymentOptions?.buildId ??
      poller?.workerVersionCapabilities?.buildId;
    return buildId ?? '';
  };

  const pollerHasWorkflowBuildId = $derived(
    (poller) =>
      getPollerDeploymentName(poller) === workflowDeploymentName &&
      getPollerBuildId(poller) === workflowVersioningBuildId,
  );

  const pollerHasRampingBuildId = $derived(
    (poller) =>
      getPollerDeploymentName(poller) === rampingDeployment &&
      getPollerBuildId(poller) === rampingBuildId,
  );

  const pollers = $derived.by(() => {
    try {
      if (pinnedBehavior) {
        return workers?.pollers?.filter(pollerHasWorkflowBuildId) ?? [];
      } else if (autoUpgradeBehavior) {
        return (
          workers?.pollers?.filter(
            (p) => pollerHasWorkflowBuildId(p) || pollerHasRampingBuildId(p),
          ) ?? []
        );
      }
      return workers?.pollers ?? [];
    } catch (error) {
      return workers?.pollers ?? [];
    }
  });
</script>

<h2 class="flex items-center gap-2" data-testid="workers">
  {translate('workers.workers')}
  <Badge type="count">{pollers?.length || 0}</Badge>
</h2>
{#if pinnedBehavior}
  <p>
    {translate('workers.viewing-pinned-build-ids')}
  </p>
{:else if autoUpgradeBehavior}
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
  </TableHeaderRow>
  {#each pollers as poller}
    {@const deployment = getPollerDeploymentName(poller)}
    {@const buildId = getPollerBuildId(poller)}
    <TableRow data-testid="worker-row">
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">{poller.identity}</p>
      </td>
      <td class="text-left" data-testid="worker-build-id">
        <p class="select-all break-all">
          {buildId}
        </p>
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
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan="5">
        <EmptyState title={translate('workflows.workers-empty-state')} />
      </td>
    </tr>
  {/each}
</Table>
