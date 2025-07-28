<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  export let groups: EventGroups;

  const getBadgeType = (classification: string) => {
    switch (classification) {
      case 'Completed':
        return 'success';
      case 'Failed':
      case 'Terminated':
        return 'danger';
      case 'TimedOut':
      case 'Canceled':
        return 'warning';
      default:
        return 'default';
    }
  };
</script>

<Table class="w-full" data-testid="metadata-events-table">
  <caption class="sr-only" slot="caption">
    {translate('workflows.user-metadata-tab')}
  </caption>
  <TableHeaderRow slot="headers">
    <th class="w-20 text-left">{translate('common.id')}</th>
    <th class="w-40 text-left">{translate('common.event-type')}</th>
    <th class="w-24 text-left">{translate('common.status')}</th>
    <th class="w-36 text-left">{translate('common.time')}</th>
  </TableHeaderRow>

  {#each groups as group}
    <TableRow class="hover:bg-interactive-table-hover">
      <td class="px-3 py-3 text-left">
        <span class="font-mono text-sm text-secondary">{group.id}</span>
      </td>
      <td class="px-3 py-3 text-left">
        <div class="flex flex-col gap-1 capitalize">
          {group.category}
        </div>
      </td>
      <td class="px-3 py-3 text-left">
        <Badge type={getBadgeType(group.finalClassification)} class="text-xs">
          {group.finalClassification}
        </Badge>
      </td>
      <td class="px-3 py-3 text-left">
        <div class="flex items-center gap-2">
          <Icon name="clock" class="h-3 w-3 text-secondary/60" />
          <span class="truncate text-sm">
            {formatDate(group.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </span>
        </div>
      </td>
    </TableRow>
  {/each}
</Table>
