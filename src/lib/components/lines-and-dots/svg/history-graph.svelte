<script lang="ts">
  import { groupWorkflowTaskEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEventWithPending } from '$lib/types/events';
  import { getGroupForEventOrPendingEvent } from '$lib/utilities/pending-activities';

  import { getNextDistanceAndOffset, HistoryConfig } from '../constants';

  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Line from './line.svelte';

  interface Props {
    groups: EventGroups;
    history: WorkflowEventWithPending[];
  }

  let { groups, history }: Props = $props();

  const workflowTaskGroups = $derived(
    groupWorkflowTaskEvents($filteredEventHistory, $eventFilterSort),
  );
  const allGroups = $derived([...workflowTaskGroups, ...groups]);

  const { height, radius } = HistoryConfig;

  const nodeBuffer = 4 * radius;
  const maxWidth = 600;

  const canvasWidth = $derived.by(() => {
    let width = nodeBuffer;
    history.forEach((event) => {
      const { offset } = getNextDistanceAndOffset(
        history,
        event,
        groups,
        height,
        $eventFilterSort,
      );
      width = Math.max(width, offset * 1.75 * radius + nodeBuffer);
    });
    return width;
  });
  const visualWidth = $derived(Math.min(canvasWidth - 2 * radius, maxWidth));

  const canvasHeight = $derived(history.length * height);
</script>

<div
  class="hidden text-right xl:block"
  style="width: {canvasWidth}px; max-width: {maxWidth}px;"
  class:overflow-hidden={canvasWidth > maxWidth}
>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight}
    width={canvasWidth}
  >
    <Line
      startPoint={[visualWidth, 0]}
      endPoint={[visualWidth, canvasHeight]}
      strokeWidth={3}
    />
    <svg
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
    >
      {#each history as event, index}
        {@const group = getGroupForEventOrPendingEvent(allGroups, event)}
        <HistoryGraphRowVisual
          {event}
          {group}
          groups={allGroups}
          {history}
          canvasWidth={visualWidth}
          {index}
        />
      {/each}
    </svg>
  </svg>
</div>
