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

  interface Props {
    event: WorkflowEventWithPending;
    group: EventGroup;
    history: WorkflowEventWithPending[];
    groups: EventGroups;
    index: number;
    canvasWidth: number;
  }

  let { event, group, history, groups, index, canvasWidth }: Props = $props();

  const { height, radius } = HistoryConfig;
  const strokeWidth = radius / 2;

  const y = $derived(index * height + height / 2);
  const distanceAndOffset = $derived(
    getNextDistanceAndOffset(history, event, groups, height, $eventFilterSort),
  );
  const nextDistance = $derived(distanceAndOffset.nextDistance);
  const offset = $derived(distanceAndOffset.offset);

  const zoomNextDistance = $derived(offset > 0 && nextDistance);

  const classification = $derived(
    isPendingActivity(event) || isPendingNexusOperation(event)
      ? 'pending'
      : event?.classification,
  );

  const horizontalOffset = $derived(offset * 1.75 * radius);
  const nextIsPending = $derived(
    isEvent(event) && group?.lastEvent.id === event?.id && group?.isPending,
  );
  const connectLine = $derived(
    isPendingActivity(event) || isPendingNexusOperation(event) || offset === 0
      ? false
      : !isMiddleEvent(event, groups),
  );
  const category = $derived(
    isPendingActivity(event) || isPendingNexusOperation(event)
      ? 'pending'
      : nextIsPending
        ? event?.category
        : (undefined as EventTypeCategory | 'pending' | undefined),
  );
  const reverseSort = $derived($eventFilterSort === 'descending');
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
