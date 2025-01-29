<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getBuildIdReachability,
    type GetPollersResponse,
    type TaskQueueCompatibility,
    type WorkerReachability,
  } from '$lib/services/pollers-service';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    getCurrentCompatibilityDefaultVersion,
    getCurrentPollerBuildId,
    getDefaultVersionForSet,
    getNonDefaultVersionsForSet,
    getOrderedVersionSets,
  } from '$lib/utilities/task-queue-compatibility';

  import PollerIcon from './poller-icon.svelte';

  export let taskQueue: string;
  export let workers: GetPollersResponse;
  export let reachability: WorkerReachability | undefined = undefined;
  export let compatibility: TaskQueueCompatibility | undefined = undefined;

  $: versionSets = getOrderedVersionSets(compatibility);
  $: defaultVersion = getCurrentCompatibilityDefaultVersion(compatibility);
</script>

<h2 data-testid="version-sets">
  {translate('workers.version-sets')}
</h2>
<Table class="mb-6 w-full min-w-[600px] table-fixed">
  {#snippet headers()}
    <TableHeaderRow>
      <th class="w-3/12">{translate('workers.default')}</th>
      <th class="w-9/12">{translate('workers.compatible-build-ids')}</th>
    </TableHeaderRow>
  {/snippet}
  {#each versionSets as set, index (index)}
    <TableRow data-testid="version-row">
      <td class="text-left" data-testid="version-default">
        <CompatibilityBadge
          defaultVersion
          active={index === 0}
          buildId={getDefaultVersionForSet(set.buildIds)}
        >
          <svelte:fragment slot="overall-default-worker">
            {#if index === 0}{translate('workers.overall')}{/if}
          </svelte:fragment>
          <svelte:fragment slot="default-worker">
            {translate('workers.default')}
          </svelte:fragment>
        </CompatibilityBadge>
      </td>
      <td class="text-left" data-testid="version-compatible-builds">
        <div class="flex flex-wrap gap-2 font-mono">
          {#each getNonDefaultVersionsForSet(set.buildIds) as buildId}
            <CompatibilityBadge active={false} {buildId}>
              <svelte:fragment slot="default-worker">
                {translate('workers.default')}
              </svelte:fragment>
            </CompatibilityBadge>
          {/each}
        </div>
      </td>
    </TableRow>
  {:else}
    <tr class="w-full">
      <td colspan="2">
        <EmptyState title={translate('workers.no-version-sets-found')} />
      </td>
    </tr>
  {/each}
</Table>
<h2 class="flex items-center gap-2" data-testid="workers">
  {translate('workers.workers')}
  <Badge type="count">{workers?.pollers?.length || 0}</Badge>
</h2>
<Table class="mb-6 w-full min-w-[600px] table-fixed">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.workers-tab')}</caption
  >
  {#snippet headers()}
    <TableHeaderRow>
      <th
        class={reachability?.buildIdReachability?.length ? 'w-3/12' : 'w-6/12'}
        >{translate('common.id')}</th
      >
      {#if reachability?.buildIdReachability?.length}
        <th class="w-3/12">{translate('workers.version')}</th>
        <th class="w-2/12">{translate('workers.retirability')}</th>
      {/if}
      <th class="w-2/12">{translate('workflows.last-accessed')}</th>
      <th class="w-2/12">
        <p class="text-center">
          {translate('workflows.workflow-task-handler')}
        </p>
      </th>
      <th class="w-2/12 text-center">
        <p class="text-center">{translate('workflows.activity-handler')}</p>
      </th>
    </TableHeaderRow>
  {/snippet}
  {#each workers?.pollers as poller (poller.identity)}
    {@const buildId = getCurrentPollerBuildId(poller)}
    {@const pollerReachability = getBuildIdReachability(
      reachability,
      taskQueue,
      buildId,
    )}
    <TableRow data-testid="worker-row">
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">{poller.identity}</p>
      </td>
      {#if reachability?.buildIdReachability?.length}
        <td class="text-left" data-testid="worker-identity">
          <p class="select-all">
            <CompatibilityBadge
              defaultVersion={buildId === defaultVersion}
              active={buildId === defaultVersion}
              {buildId}
            >
              <svelte:fragment slot="overall-default-worker">
                {#if buildId === defaultVersion}{translate(
                    'workers.overall',
                  )}{/if}
              </svelte:fragment>
              <svelte:fragment slot="default-worker">
                {translate('workers.default')}
              </svelte:fragment>
            </CompatibilityBadge>
          </p>
        </td>
        <td class="text-left" data-testid="worker-last-access-time">
          <p>
            <span class:reachability={!!pollerReachability}
              >{pollerReachability}</span
            >
          </p>
        </td>
      {/if}
      <td class="text-left" data-testid="worker-last-access-time">
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
      <td colspan={reachability?.buildIdReachability?.length ? 6 : 4}>
        <EmptyState title={translate('workflows.workers-empty-state')} />
      </td>
    </tr>
  {/each}
</Table>

<style lang="postcss">
  .reachability {
    @apply rounded-sm bg-slate-200 px-2 py-1;
  }
</style>
