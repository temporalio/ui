<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import QuickFilterTableCell from '$lib/components/search-attribute-filter/quick-filter-table-cell.svelte';
  import ActivityStatusBadge from '$lib/components/standalone-activities/activity-status-badge.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { activityFilters } from '$lib/stores/filters';
  import { activitySearchAttributes } from '$lib/stores/search-attributes';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { isActivityDelayed } from '$lib/utilities/delayed-activities';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
  import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { toQuickFilterValue } from '$lib/utilities/query/quick-filter';
  import { routeForStandaloneActivityDetails } from '$lib/utilities/route-for';

  import {
    getActivityColumnAttribute,
    getActivityColumnValue,
  } from './column-search-attributes';

  type Props = {
    column: ConfigurableTableHeader;
    activity: ActivityExecutionInfo;
  };
  let { column, activity }: Props = $props();

  const { label, width } = $derived(column);
  const namespace = $derived(page.params.namespace);

  const attribute = $derived(getActivityColumnAttribute(label));
  const type = $derived($activitySearchAttributes[attribute]);
  const value = $derived(getActivityColumnValue(label, activity));
  const filterValue = $derived(toQuickFilterValue({ attribute, type, value }));
  const filterable = $derived(filterValue !== null);

  const href = $derived(
    ['Activity ID', 'Run ID'].includes(label)
      ? routeForStandaloneActivityDetails({
          namespace,
          activityId: activity.activityId ?? '',
          runId: activity.runId ?? '',
        })
      : undefined,
  );

  // Datetime cells display and copy the normalized ISO value, so the text in
  // the cell and the value the filter uses never drift apart.
  const displayValue = $derived(
    type === SEARCH_ATTRIBUTE_TYPE.DATETIME
      ? (filterValue ?? '')
      : value === undefined
        ? ''
        : String(value),
  );

  const className = $derived(
    twMerge(
      'h-8 whitespace-nowrap',
      width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
    ),
  );
  const widthStyle = $derived(columnWidthStyle(width));
  const testId = 'activities-summary-table-body-cell';
</script>

{#snippet cellContent()}
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
    {displayValue}
  {/if}
{/snippet}

{#if filterable}
  <QuickFilterTableCell
    class={className}
    style={widthStyle}
    data-testid={testId}
    filterIconTitle={translate('common.filter-activities')}
    filters={activityFilters}
    {attribute}
    {type}
    {value}
    copyValue={displayValue}
  >
    {@render cellContent()}
  </QuickFilterTableCell>
{:else}
  <td class={className} style={widthStyle} data-testid={testId}>
    {@render cellContent()}
  </td>
{/if}
