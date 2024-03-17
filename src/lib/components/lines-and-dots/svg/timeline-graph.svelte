<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { TimelineConfig } from '../constants';
  import TimelineAxisLabels from '../timeline-axis-labels.svelte';

  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';

  export let workflow: WorkflowExecution;
  export let history: WorkflowEvents;
  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let zoomLevel: number = 1;
  export let canvasWidth: number;
  export let onClick: (group: EventGroup) => void | undefined = undefined;

  const { gap, gutter, radius } = TimelineConfig;

  $: startTime = history[0]?.eventTime || workflow.startTime;

  $: isActive = (group: EventGroup): boolean => {
    if (!activeGroup) return true;
    return activeGroup?.id === group.id;
  };

  $: canvasHeight = Math.max(gap * 2 + gap * groups.length, 200);
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight / zoomLevel}
  width={canvasWidth}
>
  <Line
    startPoint={[gutter, 0]}
    endPoint={[gutter, canvasHeight]}
    strokeWidth={radius / 2}
  />
  <Line
    startPoint={[canvasWidth - gutter, 0]}
    endPoint={[canvasWidth - gutter, canvasHeight]}
    strokeWidth={radius / 2}
    status={workflow.status}
  />
  {#each groups as group, index (group.id)}
    <TimelineGraphRow
      {workflow}
      {group}
      {index}
      {canvasWidth}
      {startTime}
      active={isActive(group)}
      onClick={() => onClick && onClick(group)}
    />
  {/each}
  <TimelineAxis
    x1={gutter}
    x2={canvasWidth - gutter - 2}
    y={canvasHeight - 2}
  />
</svg>
<TimelineAxisLabels {startTime} />
