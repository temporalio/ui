<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';

  interface Props {
    column: ConfigurableTableHeader;
    children?: Snippet;
  }

  let { children, column }: Props = $props();
  let { label } = $derived(column);
</script>

<th data-testid="workflows-summary-table-header-cell-{label}">
  <div class="flex items-center gap-2">
    {label}
    {@render children?.()}
  </div>
</th>
