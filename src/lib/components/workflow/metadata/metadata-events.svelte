<script lang="ts">
  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
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

<div class="overflow-x-auto">
  <Table class="min-w-full table-fixed" data-testid="metadata-events-table">
    <caption class="sr-only" slot="caption">
      {translate('workflows.user-metadata-tab')}
    </caption>
    <TableHeaderRow slot="headers">
      <th class="w-1/5 px-3 py-3 text-left">{translate('common.event-type')}</th
      >
      <th class="w-1/6 px-3 py-3 text-left">{translate('common.status')}</th>
      <th class="w-1/4 px-3 py-3 text-left">{translate('common.time')}</th>
      <th class="w-auto px-3 py-3 text-left">{translate('common.summary')}</th>
    </TableHeaderRow>

    {#each groups as group}
      <TableRow class="hover:bg-interactive-table-hover">
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
        <td class="px-3 py-3 text-left">
          {#if group.userMetadata?.summary}
            <MetadataDecoder
              value={group.userMetadata.summary}
              fallback={translate('events.decode-failed')}
              let:decodedValue
            >
              <span class="font-mono text-sm text-secondary"
                >{decodedValue}</span
              >
            </MetadataDecoder>
          {:else}
            <span class="font-mono text-sm text-secondary">-</span>
          {/if}
        </td>
      </TableRow>
    {/each}
  </Table>
</div>
