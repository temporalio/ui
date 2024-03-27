<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import {
    activeGroupsHeightAboveGroup,
    getDetailsBoxHeight,
    TimelineConfig,
  } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';

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

  export let activeGroups: string[] = [];
  export let zoomLevel: number = 1;
  export let canvasWidth: number;
  export let onClick: (group: EventGroup) => void | undefined = undefined;

  const { height, gutter, radius, fontSizeRatio } = TimelineConfig;

  $: startTime = history[0]?.eventTime || workflow.startTime;
  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      if (!group) return 0;
      return getDetailsBoxHeight(group, fontSizeRatio);
    })
    .reduce((acc, height) => acc + height, 0);

  $: timelineHeight =
    Math.max(height * (groups.length + 1), 200) + activeDetailsHeight;
  $: canvasHeight = timelineHeight + 200;
</script>

<EndTimeInterval let:endTime let:duration>
  <svg
    {x}
    {y}
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={(staticHeight || canvasHeight) / zoomLevel}
    width={canvasWidth}
  >
    <Line
      startPoint={[gutter, 0]}
      endPoint={[gutter, timelineHeight]}
      strokeWidth={radius / 2}
    />
    <Line
      startPoint={[canvasWidth - gutter, 0]}
      endPoint={[canvasWidth - gutter, timelineHeight]}
      strokeWidth={radius / 2}
      status={workflow.status}
    />
    <TimelineAxis
      x1={gutter - radius / 4}
      x2={canvasWidth - gutter + radius / 4}
      {timelineHeight}
      {endTime}
      {duration}
    />
    {#each groups as group, index (group.id)}
      {@const y =
        (index + 1) * height +
        activeGroupsHeightAboveGroup(
          activeGroups,
          group,
          groups,
          fontSizeRatio,
        )}
      <TimelineGraphRow
        {y}
        {group}
        {activeGroups}
        {canvasWidth}
        {startTime}
        {endTime}
        onClick={() => onClick && onClick(group)}
      />
      {#if activeGroups.includes(group.id)}
        <GroupDetailsRow
          {y}
          {group}
          {canvasWidth}
          config={TimelineConfig}
          view="timeline"
        />
      {/if}
    {/each}
  </svg>
</EndTimeInterval>
