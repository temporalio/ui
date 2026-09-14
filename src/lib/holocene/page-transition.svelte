<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div
  in:fly={{ y: -50, duration: 150, delay: 50 }}
  out:fly={{ y: -50, duration: 150 }}
>
  {@render children?.()}
</div>
