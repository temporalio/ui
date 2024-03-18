<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { DetailsConfig, TimelineConfig } from '../constants';
  import TimelineAxisLabels from '../timeline-axis-labels.svelte';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';

  export let x = 0;
  export let y = 0;
  export let staticHeight = 0;

  export let workflow: WorkflowExecution;
  export let history: WorkflowEvents;
  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let zoomLevel: number = 1;
  export let canvasWidth: number;
  export let onClick: (group: EventGroup) => void | undefined = undefined;

  const { height, gutter, radius } = TimelineConfig;
  const { boxHeight } = DetailsConfig;

  $: startTime = history[0]?.eventTime || workflow.startTime;

  $: canvasHeight =
    Math.max(height * 2 + height * groups.length, 200) +
    (activeGroup ? boxHeight : 0);
</script>

<svg
  {x}
  {y}
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={(staticHeight || canvasHeight) / zoomLevel}
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
      {activeGroup}
      {group}
      {index}
      {canvasWidth}
      {startTime}
      onClick={() => onClick && onClick(group)}
    />
    {#if activeGroup?.id === group.id}
      <GroupDetailsRow
        {group}
        {index}
        {canvasWidth}
        onClick={() => onClick && onClick(group)}
      />
    {/if}
  {/each}
  <TimelineAxis
    x1={gutter}
    x2={canvasWidth - gutter - 2}
    y={canvasHeight - 2}
  />
</svg>
<TimelineAxisLabels {startTime} />
