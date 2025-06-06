<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    'aria-label': string;
    rowCount: number;
  }
  let { children, 'aria-label': ariaLabel, rowCount }: Props = $props();
</script>

<dl
  class="grid auto-cols-[max-content_minmax(0,max-content)] grid-flow-col gap-x-4 gap-y-1"
  style={`--row-count: ${rowCount}`}
  aria-label={ariaLabel}
>
  {@render children()}
</dl>
