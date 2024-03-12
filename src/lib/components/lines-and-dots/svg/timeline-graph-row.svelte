<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type {
    EventTypeCategory,
    PendingActivity,
    WorkflowEvent,
  } from '$lib/types/events';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';

  export let event: WorkflowEvent | PendingActivity;
  export let group: EventGroup;
  export let x = 0;
  export let initialX = 0;
  export let nextX = 0;
  export let canvasWidth: number;
  export let active = false;
  export let onClick: () => void;
  export let showText = false;

  const { radius } = TimelineConfig;

  $: nextIsPending =
    group?.lastEvent.id === event?.id && group?.pendingActivity;
  $: initiatedEvent =
    event.id === group.initialEvent.id &&
    !nextIsPending &&
    group.eventList.length === 3;
  $: atTheEnd = canvasWidth - x < group?.name?.length * 9 ?? 200;
  $: duration = formatDistanceAbbreviated({
    start: group.initialEvent.eventTime,
    end: group.lastEvent.eventTime,
    includeMilliseconds: true,
  });
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
>
  {#if nextX}
    <Line
      startPoint={[x, y]}
      endPoint={[x + nextX, y]}
      {category}
      classification={group.lastEvent.classification}
      {active}
      strokeWidth={radius * 2}
      initiated={initiatedEvent}
      strokeDasharray={nextIsPending ? '3' : 'none'}
    />
  {/if}
  <Dot point={[x, y]} {category} {active} r={radius} />
  {#if showText}
    <Text
      point={[atTheEnd ? initialX : x + 2 * radius, y + radius / 1.5]}
      {category}
      {active}
      textAnchor={atTheEnd ? 'end' : 'start'}
    >
      {group?.name}
    </Text>
  {/if}
  {#if event.id === group.initialEvent.id}
    <Text point={[x - radius, y - 1.5 * radius]} {active} textAnchor="start">
      {duration}
    </Text>
  {/if}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
