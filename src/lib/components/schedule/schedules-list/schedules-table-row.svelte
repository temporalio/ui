<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import SearchAttributeValue from '$lib/components/table/search-attribute-value.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { BadgeStatus } from '$lib/io/badge-status';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { customSearchAttributes } from '$lib/stores/search-attributes';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { parseSearchAttributes } from '$lib/utilities/decode-payload';
  import { routeForSchedule } from '$lib/utilities/route-for';

  import { scheduledActionPresentations } from '../scheduled-action-types/presentation-registry';
  import { resolveScheduledActionListEntry } from '../scheduled-action-types/resolve-scheduled-action-list-entry';
  import { getRecentScheduleActions } from '../utilities/recent-actions';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { ScheduleListEntry } from '$types';

  const { namespace } = $derived(page.params);

  type Props = {
    schedule: ScheduleListEntry;
    columns: ConfigurableTableHeader[];
  };

  let { schedule, columns }: Props = $props();

  const resolvedAction = $derived(resolveScheduledActionListEntry(schedule));
  const actionColumns = $derived.by(() => {
    if (resolvedAction.type === 'unknown') return null;

    const { TypeCell, RecentRunsCell } =
      scheduledActionPresentations[resolvedAction.type].schedulesList;

    return {
      [translate('common.workflow-type')]: TypeCell,
      [translate('schedules.recent-runs')]: RecentRunsCell,
    };
  });
  const status = $derived(schedule?.info?.paused ? 'Paused' : 'Running');
  const spec = $derived(schedule?.info?.spec);
  const decodedSearchAttributes = $derived(
    parseSearchAttributes(schedule?.searchAttributes ?? {}).indexedFields ?? {},
  );
  const recentActions = $derived(
    getRecentScheduleActions(schedule.info?.recentActions ?? []),
  );
  const route = $derived(
    routeForSchedule({ namespace, scheduleId: schedule.scheduleId ?? '' }),
  );
</script>

<tr class="max-h-32">
  {#each columns as { label, width } (label)}
    {@const widthStyle = columnWidthStyle(width)}
    {@const clampToWidth = width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES}
    {@const ActionCell = actionColumns?.[label]}
    {#if label === translate('common.status')}
      <td class={twMerge('cell', clampToWidth)} style={widthStyle}>
        <BadgeStatus {status} data-testid="schedule-status" />
      </td>
    {:else if label === translate('schedules.id')}
      <td
        class={twMerge('cell whitespace-pre-line break-words', clampToWidth)}
        style={widthStyle}
      >
        <Link href={route}>{schedule.scheduleId}</Link>
      </td>
    {:else if resolvedAction.type !== 'unknown' && ActionCell}
      <ActionCell schedule={resolvedAction.schedule} {namespace} {width} />
    {:else if label === translate('schedules.recent-runs')}
      <td class={twMerge('cell truncate', clampToWidth)} style={widthStyle}>
        {#each recentActions as run (run)}
          <p><Timestamp dateTime={run.actualTime} /></p>
        {/each}
      </td>
    {:else if label === translate('schedules.upcoming-runs')}
      <td class={twMerge('cell truncate', clampToWidth)} style={widthStyle}>
        {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run (run)}
          <Timestamp as="div" dateTime={run} />
        {/each}
      </td>
    {:else if label === translate('schedules.schedule-spec')}
      <td class={twMerge('cell', clampToWidth)} style={widthStyle}>
        {#if spec}
          <ScheduleFrequency {spec} />
        {/if}
      </td>
    {:else}
      <td class={twMerge('cell', clampToWidth)} style={widthStyle}>
        {#if decodedSearchAttributes[label] !== undefined}
          <SearchAttributeValue
            value={decodedSearchAttributes[label]}
            type={$customSearchAttributes[label]}
          />
        {/if}
      </td>
    {/if}
  {/each}
</tr>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>
