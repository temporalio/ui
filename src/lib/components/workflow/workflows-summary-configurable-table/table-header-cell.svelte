<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';

  interface Props {
    column: ConfigurableTableHeader;
    children?: Snippet;
  }

  let { children, column }: Props = $props();
  let { label } = $derived(column);

  // POC: the visibility store can only order by start and end time. Every other
  // column says so rather than offering a sort that would silently reorder just
  // the rows on this page.
  const SERVER_ORDERABLE = ['Start', 'End'];
  const orderable = $derived(SERVER_ORDERABLE.includes(label));
</script>

<th scope="col" data-testid="workflows-summary-table-header-cell-{label}">
  <div class="flex items-center gap-2">
    {#if orderable}
      {label}
    {:else}
      <Tooltip
        bottomRight
        usePortal
        width={280}
        text="The visibility store can't order by {label}. Sorting here would only reorder the rows on this page — use Sort all results to load a snapshot and sort it."
      >
        <span
          class="cursor-help text-secondary underline decoration-dotted underline-offset-4"
        >
          {label}
        </span>
      </Tooltip>
    {/if}
    {@render children?.()}
  </div>
</th>
