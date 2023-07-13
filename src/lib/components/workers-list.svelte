<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import {
    getWorkerTaskReachability,
    type GetPollersResponse,
    type TaskQueueCompatibility,
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
  import { onMount } from 'svelte';

  export let taskQueue: string;
  export let workers: GetPollersResponse;
  export let compatibility: TaskQueueCompatibility;

  // onMount(async () => {
  //   const namespace = $page.params.namespace;
  //   let fetchWorkerTaskReachability = await getWorkerTaskReachability({
  //     namespace,
  //   });
  // });

  $: defaultVersion = getCurrentCompatibilityDefaultVersion(compatibility);
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-lg font-medium" data-testid="task-queue-name">
    Task Queue: <span class="select-all font-normal">{taskQueue}</span>
  </h2>

  <h2 class="text-base font-medium" data-testid="version-sets">Version Sets</h2>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class="w-3/12">Default</th>
      <th class="w-9/12">Compatible Build IDs</th>
    </TableHeaderRow>
    {#each getOrderedVersionSets(compatibility) as set, index (index)}
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

  <h2 class="text-base font-medium" data-testid="workers">Workers</h2>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <TableHeaderRow slot="headers">
      <th class="w-3/12">ID</th>
      <th class="w-3/12">Version</th>
      <th class="w-2/12">Last Accessed</th>
      <th class="w-2/12">
        <p class="text-center">Workflow Task Handler</p>
      </th>
      <th class="w-2/12 text-center">
        <p class="text-center">Activity Handler</p>
      </th>
    </TableHeaderRow>
    {#each workers?.pollers as poller (poller.identity)}
      <TableRow data-testid="worker-row">
        <td class="text-left" data-testid="worker-identity">
          <p class="select-all">{poller.identity}</p>
        </td>
        <td class="text-left" data-testid="worker-identity">
          <p class="select-all">
            <CompatibilityBadge
              defaultVersion={getCurrentPollerBuildId(poller) ===
                defaultVersion}
              active={getCurrentPollerBuildId(poller) === defaultVersion}
              buildId={getCurrentPollerBuildId(poller)}
            />
          </p>
        </td>
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
        <td colspan="6">
          <EmptyState title={'No Workers Found'} />
        </td>
      </tr>
    {/each}
  </Table>
</section>
