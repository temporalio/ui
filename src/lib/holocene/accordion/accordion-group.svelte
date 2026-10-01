<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div
  class="*:rounded-none *:border-t-0 [&>*:first-child]:rounded-t [&>*:first-child]:border-t [&>*:last-child]:rounded-b"
>
  {@render children?.()}
</div>
