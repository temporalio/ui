<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import QuickFilterCell from '$lib/components/search-attribute-filter/quick-filter-cell.svelte';
  import ActivityStatusBadge from '$lib/components/standalone-activities/activity-status-badge.svelte';
  import SearchAttributeValue from '$lib/components/table/search-attribute-value.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { activityFilters } from '$lib/stores/filters';
  import { activitySearchAttributes } from '$lib/stores/search-attributes';
  import type { ActivityExecutionListInfo } from '$lib/types/activity-execution';
  import type { SearchAttributeType } from '$lib/types/workflows';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { isActivityDelayed } from '$lib/utilities/delayed-activities';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
  import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { routeForStandaloneActivityDetails } from '$lib/utilities/route-for';

  import { ACTIVITY_QUICK_FILTER_COLUMNS } from './column-search-attributes';

  type Props = {
    column: ConfigurableTableHeader;
    activity: ActivityExecutionListInfo;
  };
  let { column, activity }: Props = $props();

  const { label, width } = $derived(column);
  const namespace = $derived(page.params.namespace);

  const className = $derived(
    twMerge(
      'h-8 whitespace-nowrap',
      width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
    ),
  );
  const href = $derived(
    ['Activity ID', 'Run ID'].includes(label)
      ? routeForStandaloneActivityDetails({
          namespace,
          activityId: activity.activityId ?? '',
          runId: activity.runId ?? '',
        })
      : undefined,
  );

  const widthStyle = $derived(columnWidthStyle(width));
  const testId = 'activities-summary-table-body-cell';
</script>

{#snippet cellContent(
  type: SearchAttributeType | undefined,
  displayValue: string,
)}
  {#if label === 'Status'}
    <ActivityStatusBadge
      status={toActivityStatus(activity.status)}
      delayed={isActivityDelayed(activity)}
    />
  {:else if label === 'Start' || label === 'End' || label === 'Execution Time'}
    <Timestamp dateTime={displayValue} />
  {:else if label === 'Execution Duration'}
    {#if activity.executionDuration}
      {formatDurationAbbreviated(activity.executionDuration)}
    {/if}
  {:else if href}
    <Link {href}>{displayValue}</Link>
  {:else}
    <SearchAttributeValue value={displayValue} {type} />
  {/if}
{/snippet}

<QuickFilterCell
  columns={ACTIVITY_QUICK_FILTER_COLUMNS}
  searchAttributes={$activitySearchAttributes}
  filters={activityFilters}
  filterIconTitle={translate('common.filter-activities')}
  {label}
  row={activity}
  class={className}
  style={widthStyle}
  data-testid={testId}
>
  {#snippet children({ type, displayValue })}
    {@render cellContent(type, displayValue)}
  {/snippet}
</QuickFilterCell>
