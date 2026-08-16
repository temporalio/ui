<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
</script>

<div
  in:fly={{
    y: reducedMotion.current ? 0 : -16,
    duration: reducedMotion.current ? 0 : 140,
    delay: reducedMotion.current ? 0 : 80,
  }}
  out:fly={{
    y: reducedMotion.current ? 0 : -16,
    duration: reducedMotion.current ? 0 : 140,
  }}
>
  {@render children?.()}
</div>
