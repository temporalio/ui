<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div
  class="grid grid-cols-subgrid grid-rows-subgrid items-center gap-3 [grid-column:auto/span_2] [grid-row:1/-1]"
>
  {@render children()}
</div>
