<script lang="ts">
  import groupBy from 'lodash.groupby';

  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { setSingleActiveGroup } from '$lib/stores/active-events';
  import { timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';

  import { CompactConfig, getGroupDetailsBoxHeight } from '../constants';

  import CompactFlagPosts from './compact-flag-posts.svelte';
  import CompactGraphVerticalRow from './compact-graph-vertical-row.svelte';
  import GroupDetailsRow from './group-details-row.svelte';
  import Text from './text.svelte';
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

  const { height, radius, width: blockWidth } = CompactConfig;

  let activeY = 0;
  let activeIndex = null;

  $: activeGroup =
    activeGroups[0] && groups.find((group) => group.id === activeGroups[0]);

  $: isActive = (group: EventGroup): boolean => {
    if (!activeGroups.length) return true;
    return activeGroup.id === group.id;
  };

  $: timeGroups = Object.entries(
    groupBy(groups, ({ initialEvent }) => initialEvent.timestamp),
  ) as [string, EventGroups][];

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

  $: maxGroupSize = Math.max(
    ...timeGroups.map(([_, group]: [string, EventGroups]) => group.length),
  );
  $: canvasHeight = (timeGroups.length + 3) * height + activeDetailsHeight;
  $: width = Math.max(maxGroupSize * blockWidth + 2 * blockWidth, canvasWidth);
</script>

<div class="bg-space-black" style="width: {width}px">
  <svg
    {x}
    {y}
    viewBox="0 0 {width} {staticHeight || canvasHeight}"
    height={(staticHeight || canvasHeight) / zoomLevel}
    width={width / zoomLevel}
  >
    <CompactFlagPosts {canvasHeight} status={workflow.status} />
    {#each timeGroups as [time, group], startIndex}
      {@const expandedHeight =
        activeIndex !== null && activeIndex < startIndex
          ? activeDetailsHeight
          : 0}
      {@const startY = (startIndex + 1.5) * height + expandedHeight}
      <Text point={[radius * 2, startY]}
        >{formatDate(new Date(time), $timeFormat)}</Text
      >
      {#each group as event, index}
        <CompactGraphVerticalRow
          group={event}
          startIndex={index}
          y={startY}
          length={blockWidth}
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
  </svg>
</div>
