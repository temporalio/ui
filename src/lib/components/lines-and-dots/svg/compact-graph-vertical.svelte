<script lang="ts">
  import groupBy from 'lodash.groupby';

  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { setSingleActiveGroup } from '$lib/stores/active-events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import {
    CompactConfig,
    getGroupDetailsBoxHeight,
    minCompactWidth,
  } from '../constants';

  import Box from './box.svelte';
  import CompactGraphVerticalRow from './compact-graph-vertical-row.svelte';
  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import WorkflowRow from './workflow-row.svelte';

  export let x = 0;
  export let y = 0;
  export let staticHeight = 0;
  export let workflow: WorkflowExecution;
  export let groups: EventGroups;
  export let activeGroups: string[] = [];
  export let zoomLevel: number = 1;
  export let canvasWidth: number;
  export let readOnly = false;

  const { height, radius } = CompactConfig;

  let activeY = 0;
  let activeIndex = null;

  $: activeGroup =
    activeGroups[0] && groups.find((group) => group.id === activeGroups[0]);

  $: isActive = (group: EventGroup): boolean => {
    if (!activeGroups.length) return true;
    return activeGroup.id === group.id;
  };

  $: timeGroups = Object.values(
    groupBy(groups, ({ initialEvent }) => initialEvent.timestamp),
  ) as EventGroups[];

  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);

  const onEventClick = (group: EventGroup, startIndex: number, y: number) => {
    if (readOnly) return;
    setSingleActiveGroup(group);
    activeIndex = startIndex;
    activeY = y;
  };
  $: canvasHeight = (timeGroups.length + 3) * height + activeDetailsHeight;
  $: width = Math.max(timeGroups.length * minCompactWidth, canvasWidth);
</script>

<div class="bg-space-black">
  <svg
    {x}
    {y}
    viewBox="0 0 {width} {staticHeight || canvasHeight}"
    height={(staticHeight || canvasHeight) / zoomLevel}
    width={width / zoomLevel}
  >
    <Box
      point={[0.5 * radius, radius]}
      width={radius * 1.5}
      height={radius * 1.5}
      classification="Started"
    />
    <Line
      startPoint={[0.5 * radius, radius]}
      endPoint={[0.5 * radius, canvasHeight - radius]}
      strokeWidth={radius / 4}
    />
    <Box
      point={[0.5 * radius, canvasHeight - radius]}
      width={radius * 1.5}
      height={radius * 1.5}
      classification="Started"
    />

    {#each timeGroups as group, startIndex}
      {@const expandedHeight =
        activeIndex !== null && activeIndex < startIndex
          ? activeDetailsHeight
          : 0}
      {@const startY = (startIndex + 2) * height + expandedHeight}
      {#each group as event, index}
        <CompactGraphVerticalRow
          group={event}
          startIndex={index}
          y={startY}
          length={(canvasWidth - 100) / group.length}
          active={isActive(event)}
          onClick={() => onEventClick(event, startIndex, y)}
        />
      {/each}
    {:else}
      <WorkflowRow {workflow} y={2 * height} length={canvasWidth} active />
    {/each}
    {#if activeGroup}
      {#key activeGroup.id}
        <GroupDetailsRow
          group={activeGroup}
          {canvasWidth}
          x={0}
          y={activeY + 1.25 * radius}
        />
      {/key}
    {/if}
    <!-- {#if !workflow.isRunning}
      <Text
        point={[canvasWidth / 2, canvasHeight - height + 1.2 * fontSizeRatio]}
        fontSize="24px"
        fontWeight="700">End</Text
      >
    {/if} -->
  </svg>
</div>
