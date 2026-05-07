<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="*:border-t-0 [&>*:first-child]:border-t">
  {@render children?.()}
</div>
