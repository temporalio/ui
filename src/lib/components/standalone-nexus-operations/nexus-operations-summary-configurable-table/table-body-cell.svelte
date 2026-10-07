<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import QuickFilterCell from '$lib/components/search-attribute-filter/quick-filter-cell.svelte';
  import SearchAttributeValue from '$lib/components/table/search-attribute-value.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import { nexusOperationSearchAttributes } from '$lib/stores/search-attributes';
  import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
  import type { SearchAttributeType } from '$lib/types/workflows';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForStandaloneNexusOperationDetails } from '$lib/utilities/route-for';

  import NexusOperationStatusBadge from '../nexus-operation-status-badge.svelte';
  import { NEXUS_OPERATION_QUICK_FILTER_COLUMNS } from './column-search-attributes';

  type Props = {
    column: ConfigurableTableHeader;
    operation: NexusOperationExecutionListInfo;
  };
  let { column, operation }: Props = $props();

  const { label, width } = $derived(column);
  const namespace = $derived(page.params.namespace);

  const className = $derived(
    twMerge(
      'h-8 whitespace-nowrap',
      width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
    ),
  );
  const href = $derived(
    ['Operation ID', 'Run ID'].includes(label)
      ? routeForStandaloneNexusOperationDetails({
          namespace,
          operationId: operation.operationId ?? '',
          runId: operation.runId ?? '',
        })
      : undefined,
  );

  const widthStyle = $derived(columnWidthStyle(width));
  const testId = 'nexus-operations-summary-table-body-cell';
</script>

{#snippet cellContent(
  type: SearchAttributeType | undefined,
  displayValue: string,
)}
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
    <SearchAttributeValue value={displayValue} {type} />
  {/if}
{/snippet}

<QuickFilterCell
  columns={NEXUS_OPERATION_QUICK_FILTER_COLUMNS}
  searchAttributes={$nexusOperationSearchAttributes}
  filters={nexusOperationFilters}
  filterIconTitle={translate('common.filter-nexus-operations')}
  {label}
  row={operation}
  class={className}
  style={widthStyle}
  data-testid={testId}
>
  {#snippet children({ type, displayValue })}
    {@render cellContent(type, displayValue)}
  {/snippet}
</QuickFilterCell>
