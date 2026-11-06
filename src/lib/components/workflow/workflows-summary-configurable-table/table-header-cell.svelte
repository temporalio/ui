<script lang="ts">
  import ColumnHeaderFilter from '$lib/components/search-attribute-filter/column-header-filter.svelte';
  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { workflowFilters } from '$lib/stores/filters';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    columnWidthStyle,
    MIN_COLUMN_WIDTH,
  } from '$lib/utilities/column-width';

  import {
    ARCHIVAL_CONDITIONALS,
    getWorkflowColumnFilter,
  } from './column-search-attributes';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
    archival?: boolean;
  }

  let { column, onResize, archival = false }: Props = $props();
  let { label, width } = $derived(column);

  const columnFilter = $derived(
    getWorkflowColumnFilter(label, $searchAttributes, { archival }),
  );
</script>

{#snippet filter()}
  {#if columnFilter}
    <ColumnHeaderFilter
      attribute={columnFilter.attribute}
      type={columnFilter.type}
      {label}
      filters={workflowFilters}
      conditionals={archival ? ARCHIVAL_CONDITIONALS : undefined}
    />
  {/if}
{/snippet}

<SortableTableHeader
  column={label}
  leading={columnFilter ? filter : undefined}
  scope="col"
  class="relative"
  style={columnWidthStyle(width)}
  data-testid="workflows-summary-table-header-cell-{label}"
>
  {#if onResize}
    <ColumnResizeHandle {label} {width} min={MIN_COLUMN_WIDTH} {onResize} />
  {/if}
</SortableTableHeader>
