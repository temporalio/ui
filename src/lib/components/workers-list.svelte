<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    type GetPollersResponse,
    type TaskQueueCompatibility,
    type TaskQueueRules,
    type WorkerReachability,
  } from '$lib/services/pollers-service';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { getOrderedVersionSets } from '$lib/utilities/task-queue-compatibility';

  import WorkerCompatibility from './worker-compatibility.svelte';
  import WorkerRules from './worker-rules.svelte';

  export let taskQueue: string;
  export let workers: GetPollersResponse;
  export let rules: TaskQueueRules | undefined = undefined;
  export let compatibility: TaskQueueCompatibility | undefined = undefined;
  export let reachability: WorkerReachability | undefined = undefined;

  $: versionSets = getOrderedVersionSets(compatibility);
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-lg font-medium" data-testid="task-queue-name">
    {translate('common.task-queue')}:
    <span class="select-all font-normal">{taskQueue}</span>
  </h2>
  {#if rules}
    <WorkerRules {workers} {rules} />
  {:else if versionSets?.length}
    <WorkerCompatibility {taskQueue} {workers} {compatibility} {reachability} />
  {:else}
    <h2
      class="flex items-center gap-2 text-base font-medium"
      data-testid="workers"
    >
      {translate('workers.workers')}
      <Badge type="count" class="rounded-sm"
        >{workers?.pollers?.length || 0}</Badge
      >
    </h2>
    <Table class="mb-6 w-full min-w-[600px] table-fixed">
      <caption class="sr-only" slot="caption"
        >{translate('workflows.workers-tab')}</caption
      >
      <TableHeaderRow slot="headers">
        <th class={'w-6/12'}>{translate('common.id')}</th>
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
      {#each workers?.pollers as poller (poller.identity)}
        <TableRow data-testid="worker-row">
          <td class="text-left" data-testid="worker-identity">
            <p class="select-all">{poller.identity}</p>
          </td>
          <td class="text-left" data-testid="worker-last-access-time">
            <p class="select-all">
              {formatDate(poller.lastAccessTime, $timeFormat, {
                relative: $relativeTime,
              })}
            </p>
          </td>
          <td data-testid="workflow-poller">
            {#if poller.taskQueueTypes.includes('WORKFLOW')}
              <Icon
                name="checkmark"
                class="m-auto text-blue-700"
                title={translate('common.yes')}
              />
            {:else}
              <Icon
                name="close"
                class="m-auto text-primary"
                title={translate('common.no')}
              />
            {/if}
          </td>
          <td data-testid="activity-poller">
            {#if poller.taskQueueTypes.includes('ACTIVITY')}
              <Icon
                name="checkmark"
                class="m-auto text-blue-700"
                title={translate('common.yes')}
              />
            {:else}
              <Icon
                name="close"
                class="m-auto text-primary"
                title={translate('common.no')}
              />
            {/if}
          </td>
        </TableRow>
      {:else}
        <tr class="w-full">
          <td colspan={6}>
            <EmptyState title={translate('workflows.workers-empty-state')} />
          </td>
        </tr>
      {/each}
    </Table>
  {/if}
</section>
