<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type {
    EventClassification,
    EventTypeCategory,
    WorkflowEventWithPending,
  } from '$lib/types/events';
  import { getEventClassificationLabel } from '$lib/utilities/get-status-label';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import { dotColors, strokeColor } from '../colors';
  import { RADIUS, ROW_HEIGHT } from './constants';
  import { getNextDistanceAndOffset, isMiddleEvent } from './positioning';

  interface Props {
    event: WorkflowEventWithPending;
    group: EventGroup;
    history: WorkflowEventWithPending[];
    groups: EventGroups;
    index: number;
    canvasWidth: number;
  }

  let { event, group, history, groups, index, canvasWidth }: Props = $props();

  const strokeWidth = RADIUS / 2;
  const DOT_STROKE = 1; // dot border (matches the old Dot usage here)

  const centerY = $derived(index * ROW_HEIGHT + ROW_HEIGHT / 2);
  const distanceAndOffset = $derived(
    getNextDistanceAndOffset(
      history,
      event,
      groups,
      ROW_HEIGHT,
      $eventFilterSort,
    ),
  );
  const nextDistance = $derived(distanceAndOffset.nextDistance);
  const offset = $derived(distanceAndOffset.offset);

  const zoomNextDistance = $derived(offset > 0 && nextDistance);

  const classification = $derived(
    isPendingActivity(event) || isPendingNexusOperation(event)
      ? 'pending'
      : event?.classification,
  );

  const horizontalOffset = $derived(offset * 1.75 * RADIUS);
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

  const isRetrying = $derived(
    !!group?.pendingActivity && Number(group.pendingActivity.attempt) > 1,
  );

  const statusForLabel = $derived(
    isRetrying
      ? 'Retrying'
      : classification === 'pending'
        ? 'Pending'
        : classification,
  );

  const classificationLabel = $derived(
    getEventClassificationLabel(statusForLabel),
  );

  const eventTypeLabel = $derived(
    event && 'eventType' in event
      ? event.eventType
      : translate('common.unknown'),
  );

  const accessibleName = $derived(
    translate('events.row-accessible-name', {
      eventType: eventTypeLabel,
      classification: classificationLabel,
    }),
  );
</script>

{#snippet dot(
  point: [number, number],
  eventClassification?: EventClassification | 'pending',
)}
  {@const colors = dotColors(eventClassification)}
  <rect
    fill={colors.fill}
    stroke={colors.stroke}
    stroke-width={DOT_STROKE}
    x={point[0] - RADIUS}
    y={point[1] - RADIUS}
    width={RADIUS * 2}
    height={RADIUS * 2}
    rx={RADIUS * 0.3}
  />
{/snippet}

{#snippet line(opts: {
  startPoint: [number, number];
  endPoint: [number, number];
  category?: EventTypeCategory | 'pending' | 'retry';
  pending?: boolean;
})}
  {@const {
    startPoint,
    endPoint,
    category: lineCategory,
    pending = false,
  } = opts}
  <line
    stroke={strokeColor({ category: lineCategory })}
    class:animate-line={pending}
    stroke-width={2}
    stroke-dasharray={pending ? '3' : 'none'}
    x1={Math.max(0, startPoint[0])}
    x2={Math.max(0, endPoint[0])}
    y1={startPoint[1]}
    y2={endPoint[1]}
  />
{/snippet}

<g role="img" aria-label={accessibleName}>
  {#if connectLine}
    {@render line({
      startPoint: [canvasWidth, centerY],
      endPoint: [canvasWidth - horizontalOffset - RADIUS, centerY],
    })}
  {/if}
  {#if !reverseSort}
    {@render dot([canvasWidth - horizontalOffset, centerY], classification)}
  {/if}
  {#if zoomNextDistance}
    {@render line({
      startPoint: [
        canvasWidth - horizontalOffset - RADIUS / 2 + strokeWidth,
        centerY + RADIUS + strokeWidth / 2,
      ],
      endPoint: [
        canvasWidth - horizontalOffset - RADIUS / 2 + strokeWidth,
        centerY + zoomNextDistance + RADIUS,
      ],
      category: group?.pendingActivity
        ? Number(group.pendingActivity.attempt) > 1
          ? 'retry'
          : 'pending'
        : category,
      pending: nextIsPending,
    })}
  {/if}
  {#if reverseSort}
    {@render dot([canvasWidth - horizontalOffset, centerY], classification)}
  {/if}
</g>

<style lang="postcss">
  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 200;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
</style>
