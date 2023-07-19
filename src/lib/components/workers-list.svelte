<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import {
    type GetPollersResponse,
    type TaskQueueCompatibility,
    getWorkerTaskReachability,
    getBuildIdReachability,
  } from '$lib/services/pollers-service';
  import {
    getCurrentCompatibilityDefaultVersion,
    getCurrentPollerBuildId,
    getDefaultVersionForSet,
    getNonDefaultVersionsForSet,
    getOrderedVersionSets,
  } from '$lib/utilities/task-queue-compatibility';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import { page } from '$app/stores';

  export let taskQueue: string;
  export let workers: GetPollersResponse;
  export let compatibility: TaskQueueCompatibility;

  let namespace = $page.params.namespace;

  $: versionSets = getOrderedVersionSets(compatibility);
  $: defaultVersion = getCurrentCompatibilityDefaultVersion(compatibility);

  $: buildIds = workers?.pollers.map(getCurrentPollerBuildId);

  let workerTaskReachability;

  async function fetchWorkerTaskReachability(
    namespace: string,
    buildIds: string[],
  ) {
    workerTaskReachability = await getWorkerTaskReachability({
      namespace,
      buildIds,
      taskQueue,
    });
  }
  $: fetchWorkerTaskReachability(namespace, buildIds);
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-lg font-medium" data-testid="task-queue-name">
    Task Queue: <span class="select-all font-normal">{taskQueue}</span>
  </h2>

  {#if versionSets.length}
    <h2 class="text-base font-medium" data-testid="version-sets">
      Version Sets
    </h2>
    <Table class="mb-6 w-full min-w-[600px] table-fixed">
      <TableHeaderRow slot="headers">
        <th class="w-3/12">Default</th>
        <th class="w-9/12">Compatible Build IDs</th>
      </TableHeaderRow>
      {#each versionSets as set, index (index)}
        <TableRow data-testid="version-row">
          <td class="text-left" data-testid="version-default">
            <CompatibilityBadge
              defaultVersion
              active={index === 0}
              buildId={getDefaultVersionForSet(set.buildIds)}
            />
          </td>
          <td class="text-left" data-testid="version-compatible-builds">
            <div class="flex gap-2 noto flex-wrap">
              {#each getNonDefaultVersionsForSet(set.buildIds) as buildId}
                <CompatibilityBadge active={false} {buildId} />
              {/each}
            </div>
          </td>
        </TableRow>
      {:else}
        <tr class="w-full">
          <td colspan="6">
            <EmptyState title={'No Version Sets Found'} />
          </td>
        </tr>
      {/each}
    </Table>
  {/if}
  <h2 class="text-base font-medium" data-testid="workers">Workers</h2>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class={versionSets?.length ? 'w-3/12' : 'w-6/12'}>ID</th>
      {#if versionSets?.length}
        <th class="w-3/12">Version</th>
        <th class="w-2/12">Retirability</th>
      {/if}
      <th class="w-2/12">Last Accessed</th>
      <th class="w-2/12">
        <p class="text-center">Workflow Task Handler</p>
      </th>
      <th class="w-2/12 text-center">
        <p class="text-center">Activity Handler</p>
      </th>
    </TableHeaderRow>
    {#each workers?.pollers as poller (poller.identity)}
      {@const buildId = getCurrentPollerBuildId(poller)}
      {@const reachability = getBuildIdReachability(
        workerTaskReachability,
        taskQueue,
        buildId,
      )}
      <TableRow data-testid="worker-row">
        <td class="text-left" data-testid="worker-identity">
          <p class="select-all">{poller.identity}</p>
        </td>
        {#if versionSets?.length}
          <td class="text-left" data-testid="worker-identity">
            <p class="select-all">
              <CompatibilityBadge
                defaultVersion={buildId === defaultVersion}
                active={buildId === defaultVersion}
                {buildId}
              />
            </p>
          </td>
          <td class="text-left" data-testid="worker-last-access-time">
            <p>
              <span class="bg-gray-200 px-2 py-1 rounded-sm"
                >{reachability}</span
              >
            </p>
          </td>
        {/if}
        <td class="text-left" data-testid="worker-last-access-time">
          <p class="select-all">
            {formatDate(poller.lastAccessTime, $timeFormat)}
          </p>
        </td>
        <td data-testid="workflow-poller">
          {#if poller.taskQueueTypes.includes('WORKFLOW')}
            <Icon name="checkmark" class="m-auto text-blue-700" title="yes" />
          {:else}
            <Icon name="close" class="m-auto text-primary" title="no" />
          {/if}
        </td>
        <td data-testid="activity-poller">
          {#if poller.taskQueueTypes.includes('ACTIVITY')}
            <Icon name="checkmark" class="m-auto text-blue-700" title="yes" />
          {:else}
            <Icon name="close" class="m-auto text-primary" title="no" />
          {/if}
        </td>
      </TableRow>
    {:else}
      <tr class="w-full">
        <td colspan={versionSets?.length ? 8 : 6}>
          <EmptyState title={'No Workers Found'} />
        </td>
      </tr>
    {/each}
  </Table>
</section>
