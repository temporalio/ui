<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';

  import { getEventDetailsBoxHeight } from '../constants';

  import Box from './box.svelte';
  import EventDetailRow from './event-detail-row.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup | undefined = undefined;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  $: boxHeight = group
    ? group.eventList.reduce(
        (sum, event) => (sum += getEventDetailsBoxHeight(event)),
        0,
      )
    : getEventDetailsBoxHeight(event);
  $: width = event ? (4 * canvasWidth) / 5 : canvasWidth;
</script>

<g role="button" tabindex="0" class="relative cursor-pointer">
  <Box point={[x, y]} {width} height={boxHeight} fill="#465A78" />
  {#if group}
    {#each group.eventList as e, index}
      <EventDetailRow
        event={e}
        {group}
        {index}
        {canvasWidth}
        {x}
        {y}
        active={event.id === e.id}
      />
    {/each}
  {:else}
    <EventDetailRow {event} {canvasWidth} {x} {y} />
  {/if}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
