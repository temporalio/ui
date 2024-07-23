<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { setSingleActiveEvent } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import {
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
  } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let index: number;
  export let activeEvents: string[] = [];

  export let canvasWidth: number;
  export let zoomLevel: number = 1;

  const { height, radius } = HistoryConfig;

  $: y = index * height + height / 2;
  $: ({ nextDistance, offset } = getNextDistanceAndOffset(
    history,
    event,
    groups,
    height,
    $eventFilterSort,
  ));

  $: zoomY = y * zoomLevel;
  $: zoomNextDistance = offset > 0 && nextDistance * zoomLevel;

  $: classification = isPendingActivity(event)
    ? 'pending'
    : event?.classification;

  const strokeWidth = radius / 2;

  $: width = canvasWidth * zoomLevel;
  $: horizontalOffset = offset * 2 * radius;
  $: nextIsPending = group?.lastEvent.id === event?.id && group.isPending;
  $: eventInViewBox = horizontalOffset <= width;
  $: isActive =
    !activeEvents.length ||
    activeEvents.includes(event.id) ||
    !!activeEvents.find((id) => group?.eventIds.has(id));
  $: connectLine =
    isPendingActivity(event) || offset === 0
      ? false
      : !isMiddleEvent(event, groups);
  $: category = isPendingActivity(event)
    ? 'pending'
    : nextIsPending
    ? event?.category
    : '';
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => setSingleActiveEvent(event)}
  on:keypress={() => setSingleActiveEvent(event)}
  class="relative cursor-pointer"
>
  {#if connectLine}
    <Line
      startPoint={[width, zoomY]}
      endPoint={[width - horizontalOffset - radius, zoomY]}
      active={isActive}
    />
  {/if}
  {#if eventInViewBox}
    <Dot
      point={[width - horizontalOffset, zoomY]}
      {classification}
      active={isActive}
    />
  {/if}
  {#if eventInViewBox && zoomNextDistance}
    <Line
      startPoint={[
        width - horizontalOffset - radius / 2 + strokeWidth,
        zoomY + radius + strokeWidth / 2,
      ]}
      endPoint={[
        width - horizontalOffset - radius / 2 + strokeWidth,
        zoomY + zoomNextDistance + radius,
      ]}
      category={group?.pendingActivity
        ? group.pendingActivity.attempt > 1
          ? 'retry'
          : 'pending'
        : category}
      active={isActive}
      pending={nextIsPending}
    />
  {/if}
</g>
