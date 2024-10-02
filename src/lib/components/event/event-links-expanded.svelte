<script lang="ts">
  import type { EventLink as ELink } from '$lib/types/events';

  import EventLink from './event-link.svelte';

  export let links: ELink[] = [];
</script>

{#each links as link}
  {#if link?.workflowEvent}
    <div
      class="block flex w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex"
    >
      <EventLink {link} />
    </div>
  {/if}
  <!-- {#if link?.workflowEvent}
    <div
      class="block flex w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex"
    >
      Link Namespace
    </div>
  {/if} -->
{/each}
