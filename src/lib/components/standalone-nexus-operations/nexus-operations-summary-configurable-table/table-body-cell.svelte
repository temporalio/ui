<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import QuickFilterTableCell from '$lib/components/search-attribute-filter/quick-filter-table-cell.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import { nexusOperationSearchAttributes } from '$lib/stores/search-attributes';
  import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { toQuickFilterValue } from '$lib/utilities/query/quick-filter';
  import { routeForStandaloneNexusOperationDetails } from '$lib/utilities/route-for';

  import NexusOperationStatusBadge from '../nexus-operation-status-badge.svelte';
  import {
    getNexusOperationColumnAttribute,
    getNexusOperationColumnValue,
  } from './column-search-attributes';

  type Props = {
    column: ConfigurableTableHeader;
    operation: NexusOperationExecutionListInfo;
  };
  let { column, operation }: Props = $props();

  const { label, width } = $derived(column);
  const namespace = $derived(page.params.namespace);

  const attribute = $derived(getNexusOperationColumnAttribute(label));
  const type = $derived($nexusOperationSearchAttributes[attribute]);
  const value = $derived(getNexusOperationColumnValue(label, operation));
  const filterValue = $derived(toQuickFilterValue({ attribute, type, value }));
  const filterable = $derived(filterValue !== null);

  const href = $derived(
    ['Operation ID', 'Run ID'].includes(label)
      ? routeForStandaloneNexusOperationDetails({
          namespace,
          operationId: operation.operationId ?? '',
          runId: operation.runId ?? '',
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
  const testId = 'nexus-operations-summary-table-body-cell';
</script>

{#snippet cellContent()}
  {#if label === 'Status'}
    <NexusOperationStatusBadge status={operation.status} />
  {:else if label === 'Schedule Time' || label === 'Close Time'}
    <Timestamp dateTime={displayValue} />
  {:else if label === 'Execution Duration'}
    {#if operation.executionDuration}
      {formatDistanceAbbreviated({
        start: operation.scheduleTime,
        end: operation.closeTime,
        includeMilliseconds: true,
      })}
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
    filterIconTitle={translate('common.filter-nexus-operations')}
    filters={nexusOperationFilters}
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
