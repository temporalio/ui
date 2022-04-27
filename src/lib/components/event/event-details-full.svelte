<script lang="ts">
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  import { formatAttributes } from './_format-attributes';

  export let event: IterableEvent;
  export let compact = false;

  $: attributes = formatAttributes(event, { compact });
</script>

{#each Object.entries(attributes) as [key, value] (key)}
  <EventDetailsRowExpanded {key} {value} class="w-full" />
{/each}
