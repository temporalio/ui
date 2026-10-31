<script lang="ts">
  import ColumnHeaderFilter from '$lib/components/search-attribute-filter/column-header-filter.svelte';
  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import { nexusOperationSearchAttributes } from '$lib/stores/search-attributes';
  import {
    columnWidthStyle,
    MIN_COLUMN_WIDTH,
  } from '$lib/utilities/column-width';

  import { getNexusOperationColumnFilter } from './column-search-attributes';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
  }

  let { column, onResize }: Props = $props();

  const label = $derived(column.label);
  const width = $derived(column.width);

  const columnFilter = $derived(
    getNexusOperationColumnFilter(label, $nexusOperationSearchAttributes),
  );
</script>

{#snippet filter()}
  {#if columnFilter}
    <ColumnHeaderFilter
      attribute={columnFilter.attribute}
      type={columnFilter.type}
      {label}
      filters={nexusOperationFilters}
    />
  {/if}
{/snippet}

<SortableTableHeader
  column={label}
  leading={columnFilter ? filter : undefined}
  class="relative"
  style={columnWidthStyle(width)}
  data-testid="nexus-operations-summary-table-header-cell-{label}"
>
  {#if onResize}
    <ColumnResizeHandle {label} {width} min={MIN_COLUMN_WIDTH} {onResize} />
  {/if}
</SortableTableHeader>
