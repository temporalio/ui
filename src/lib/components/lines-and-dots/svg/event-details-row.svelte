<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { isAssociatedPendingActivity } from '$lib/utilities/pending-activities';

  import {
    getEventDetailsBoxHeight,
    getPendingEventDetailHeight,
    HistoryConfig,
  } from '../constants';

  import Box from './box.svelte';
  import EventDetailRow from './event-detail-row.svelte';
  import PendingDetailRow from './pending-detail-row.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let canvasWidth: number;
  export let x = 0;
  export let index: number;
  export let primary = true;

  const { height } = HistoryConfig;

  $: y = index * height;
  $: boxHeight = group
    ? group.eventList.reduce(
        (sum, event) =>
          (sum += getEventDetailsBoxHeight(event, group.pendingActivity)),
        0,
      )
    : getEventDetailsBoxHeight(event);
  $: width = canvasWidth / 2;
</script>

<g
  role="button"
  tabindex="0"
  class="relative cursor-pointer"
  opacity={primary ? '1' : '.6'}
>
  <Box point={[x, y]} {width} height={boxHeight} classification="active" />
  {#if group}
    {#if group.pendingActivity}
      <PendingDetailRow
        event={group.pendingActivity}
        {canvasWidth}
        {x}
        {y}
        active={isAssociatedPendingActivity(event, group.pendingActivity)}
      />
    {/if}
    {#each group.eventList as e, index}
      <EventDetailRow
        event={e}
        {group}
        {index}
        {canvasWidth}
        {x}
        y={group.pendingActivity
          ? y + getPendingEventDetailHeight(group.pendingActivity)
          : y}
        active={event.id === e.id}
      />
    {/each}
  {:else}
    <EventDetailRow active {event} {canvasWidth} {x} {y} />
  {/if}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
