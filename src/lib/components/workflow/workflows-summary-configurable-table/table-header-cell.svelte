<script lang="ts">
  import type { Snippet } from 'svelte';

  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import {
    type ConfigurableTableHeader,
    MIN_COLUMN_WIDTH,
  } from '$lib/stores/configurable-table-columns';
  import { columnWidthStyle } from '$lib/utilities/column-width';

  interface Props {
    column: ConfigurableTableHeader;
    onResize?: (width: number | undefined) => void;
    children?: Snippet;
  }

  let { children, column, onResize }: Props = $props();
  let { label, width } = $derived(column);
</script>

<th
  scope="col"
  class="relative"
  style={columnWidthStyle(width)}
  data-testid="workflows-summary-table-header-cell-{label}"
>
  <div class="flex items-center gap-2 overflow-hidden">
    <span class="truncate">{label}</span>
    {@render children?.()}
  </div>
  {#if onResize}
    <ColumnResizeHandle {label} {width} min={MIN_COLUMN_WIDTH} {onResize} />
  {/if}
</th>
