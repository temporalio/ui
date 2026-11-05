<script lang="ts">
  import ColumnHeaderFilter from '$lib/components/search-attribute-filter/column-header-filter.svelte';
  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { activityFilters } from '$lib/stores/filters';
  import { activitySearchAttributes } from '$lib/stores/search-attributes';
  import {
    columnWidthStyle,
    MIN_COLUMN_WIDTH,
  } from '$lib/utilities/column-width';

  import { getActivityColumnFilter } from './column-search-attributes';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
  }

  let { column, onResize }: Props = $props();

  const label = $derived(column.label);
  const width = $derived(column.width);

  const columnFilter = $derived(
    getActivityColumnFilter(label, $activitySearchAttributes),
  );
</script>

{#snippet filter()}
  {#if columnFilter}
    <ColumnHeaderFilter
      attribute={columnFilter.attribute}
      type={columnFilter.type}
      {label}
      filters={activityFilters}
    />
  {/if}
{/snippet}

<SortableTableHeader
  column={label}
  leading={columnFilter ? filter : undefined}
  scope="col"
  class="relative"
  style={columnWidthStyle(width)}
  data-testid="activities-summary-table-header-cell-{label}"
>
  {#if onResize}
    <ColumnResizeHandle {label} {width} min={MIN_COLUMN_WIDTH} {onResize} />
  {/if}
</SortableTableHeader>
