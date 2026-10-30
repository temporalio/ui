<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';
  import { fade } from 'svelte/transition';

  import type { Snippet } from 'svelte';

  interface Props {
    empty: boolean;
    emptyState: Snippet;
    children: Snippet;
  }

  let { empty, emptyState, children }: Props = $props();

  const fadeOut = $derived({
    duration: prefersReducedMotion.current ? 0 : 200,
  });
</script>

<div
  class="grid grow grid-cols-1 grid-rows-[minmax(0,1fr)]"
  class:min-h-0={!empty}
>
  {#if empty}
    <div class="col-start-1 row-start-1">
      {@render emptyState()}
    </div>
  {:else}
    <div
      class="col-start-1 row-start-1 flex min-h-0 flex-col"
      out:fade={fadeOut}
    >
      {@render children()}
    </div>
  {/if}
</div>
