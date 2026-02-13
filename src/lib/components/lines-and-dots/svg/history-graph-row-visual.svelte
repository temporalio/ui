<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type {
    EventTypeCategory,
    WorkflowEventWithPending,
  } from '$lib/types/events';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import {
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
  } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  export let event: WorkflowEventWithPending;
  export let group: EventGroup;
  export let history: WorkflowEventWithPending[];
  export let groups: EventGroups;
  export let index: number;
  export let canvasWidth: number;

  const { height, radius } = HistoryConfig;
  const strokeWidth = radius / 2;

  $: y = index * height + height / 2;
  $: ({ nextDistance, offset } = getNextDistanceAndOffset(
    history,
    event,
    groups,
    height,
    $eventFilterSort,
  ));

  $: zoomNextDistance = offset > 0 && nextDistance;

  $: classification =
    isPendingActivity(event) || isPendingNexusOperation(event)
      ? 'pending'
      : event?.classification;

  $: horizontalOffset = offset * 1.75 * radius;
  $: nextIsPending =
    isEvent(event) && group?.lastEvent.id === event?.id && group?.isPending;
  $: connectLine =
    isPendingActivity(event) || isPendingNexusOperation(event) || offset === 0
      ? false
      : !isMiddleEvent(event, groups);
  $: category =
    isPendingActivity(event) || isPendingNexusOperation(event)
      ? 'pending'
      : nextIsPending
        ? event?.category
        : (undefined as EventTypeCategory | 'pending' | undefined);
  $: reverseSort = $eventFilterSort === 'descending';
</script>

<g role="button" tabindex="0" class="relative cursor-pointer">
  {#if connectLine}
    <Line
      startPoint={[canvasWidth, y]}
      endPoint={[canvasWidth - horizontalOffset - radius, y]}
    />
  {/if}
  {#if !reverseSort}
    <Dot
      point={[canvasWidth - horizontalOffset, y]}
      {classification}
      strokeWidth={1}
    />
  {/if}
  {#if zoomNextDistance}
    <Line
      startPoint={[
        canvasWidth - horizontalOffset - radius / 2 + strokeWidth,
        y + radius + strokeWidth / 2,
      ]}
      endPoint={[
        canvasWidth - horizontalOffset - radius / 2 + strokeWidth,
        y + zoomNextDistance + radius,
      ]}
      category={group?.pendingActivity
        ? Number(group.pendingActivity.attempt) > 1
          ? 'retry'
          : 'pending'
        : category}
      pending={nextIsPending}
    />
  {/if}
  {#if reverseSort}
    <Dot
      point={[canvasWidth - horizontalOffset, y]}
      {classification}
      strokeWidth={1}
    />
  {/if}
</g>
