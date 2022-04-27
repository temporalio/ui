<script lang="ts">
  import Button from '../button.svelte';
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  import { formatAttributes } from './_format-attributes';

  export let event: IterableEvent;
  export let compact = false;

  let showAll = false;
  const primarySize = 4;
  console.log(`${event.id} EVENT ATTRIBUTES: `, event.attributes);
  $: attributes = formatAttributes(event, { compact });
  $: attributeSize = Object.entries(attributes).length;
  $: primary = Object.entries(attributes).slice(0, primarySize);
</script>

{#if showAll}
  {#each Object.entries(attributes) as [key, value] (key)}
    <EventDetailsRowExpanded {key} {value} class="w-full" />
  {/each}
  {#if attributeSize > primarySize}
    <div on:click={() => (showAll = !showAll)} class="m-2 cursor-pointer">
      - <span class="text-sm underline">Show Less</span>
    </div>
  {/if}
{:else}
  {#each primary as [key, value] (key)}
    <EventDetailsRowExpanded {key} {value} class="w-full" />
  {/each}
  {#if attributeSize > primarySize}
    <div on:click={() => (showAll = !showAll)} class="m-2 cursor-pointer">
      + <span class="text-sm underline">Show More</span>
    </div>
  {/if}
{/if}
