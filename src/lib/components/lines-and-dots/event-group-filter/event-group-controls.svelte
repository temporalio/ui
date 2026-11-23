<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';
  import { fade, slide } from 'svelte/transition';

  import type { Snippet } from 'svelte';

  import type { EventGroupOption } from '$lib/services/grouped-event-buffer';

  import EventGroupFilterMenu from './event-group-filter-menu.svelte';

  let { options, toggle }: { options: EventGroupOption[]; toggle?: Snippet } =
    $props();

  const transitionDuration = $derived(prefersReducedMotion.current ? 0 : 150);
</script>

{#if options.length}
  <div
    class="flex shrink-0"
    transition:slide={{ axis: 'x', duration: transitionDuration }}
  >
    <div class="flex" transition:fade={{ duration: transitionDuration }}>
      {@render toggle?.()}
      <EventGroupFilterMenu {options} />
    </div>
  </div>
{/if}
