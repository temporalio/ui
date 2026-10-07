<script lang="ts">
  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import {
    type ConfigurableTableHeader,
    MIN_COLUMN_WIDTH,
  } from '$lib/stores/configurable-table-columns';
  import { columnWidthStyle } from '$lib/utilities/column-width';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
  }

  let { column, onResize }: Props = $props();

  const label = $derived(column.label);
  const width = $derived(column.width);
</script>

<th
  scope="col"
  class="relative"
  style={columnWidthStyle(width)}
  data-testid="activities-summary-table-header-cell-{label}"
>
  <span class="block truncate">{label}</span>
  {#if onResize}
    <ColumnResizeHandle {label} {width} min={MIN_COLUMN_WIDTH} {onResize} />
  {/if}
</th>
