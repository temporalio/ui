<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type GetPollersResponse } from '$lib/services/pollers-service';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  import PollerIcon from './poller-icon.svelte';

  export let workers: GetPollersResponse;
</script>

<h2 class="flex items-center gap-2" data-testid="workers">
  {translate('workers.workers')}
  <Badge type="count" class="rounded-sm">{workers?.pollers?.length || 0}</Badge>
</h2>
<Table class="mb-6 w-full min-w-[600px] table-fixed">
  <caption class="sr-only" slot="caption"
    >{translate('workflows.workers-tab')}</caption
  >
  <TableHeaderRow slot="headers">
    <th class={'w-4/12'}>{translate('common.id')}</th>
    <th class={'w-3/12'}>{translate('workers.buildId')}</th>
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
  {#each workers?.pollers as poller}
    <TableRow data-testid="worker-row">
      <td class="text-left" data-testid="worker-identity">
        <p class="select-all">{poller.identity}</p>
      </td>
      <td class="text-left" data-testid="worker-build-id">
        <p class="select-all break-all">
          {poller?.workerVersionCapabilities?.buildId ?? ''}
        </p>
      </td>
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
      <td colspan={6}>
        <EmptyState title={translate('workflows.workers-empty-state')} />
      </td>
    </tr>
  {/each}
</Table>
