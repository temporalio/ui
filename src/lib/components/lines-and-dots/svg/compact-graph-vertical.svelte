<script lang="ts">
  import groupBy from 'lodash.groupby';

  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import {
    clearActives,
    setSingleActiveGroup,
  } from '$lib/stores/active-events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import {
    CompactConfig,
    getGroupDetailsBoxHeight,
    minCompactWidth,
  } from '../constants';

  import CompactGraphVerticalRow from './compact-graph-vertical-row.svelte';
  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
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

  const { height, fontSizeRatio, radius } = CompactConfig;

  let exandedGroups = [];
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
  const getNameGroups = (groups: EventGroups) => {
    return Object.values(
      groupBy(groups, ({ displayName }) => displayName),
    ) as EventGroups[];
  };
  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);
  const groupNameWithIndex = (name: string, index: number) =>
    `${index}:${name}`;
  const onRowClick = (groups: EventGroups, startIndex: number, y: number) => {
    if (readOnly) return;
    if (groups.length === 1) {
      setSingleActiveGroup(groups[0]);
      activeY = y;
      activeIndex = startIndex;
    } else {
      clearActives();
      activeIndex = null;
      const name = groupNameWithIndex(groups[0].name, startIndex);
      if (exandedGroups.includes(name)) {
        exandedGroups = exandedGroups.filter((n) => n !== name);
        if (activeGroups.includes(groups[0].id)) {
          setSingleActiveGroup(groups[0]);
          activeY = y;
          activeIndex = startIndex;
        }
      } else {
        exandedGroups = [...exandedGroups, name];
      }
    }
  };
  const onEventClick = (group: EventGroup, startIndex: number, y: number) => {
    if (readOnly) return;
    setSingleActiveGroup(group);
    activeIndex = startIndex;
    activeY = y;
  };
  $: canvasHeight = (timeGroups.length + 3) * height + activeDetailsHeight;
  $: width = Math.max(timeGroups.length * minCompactWidth, canvasWidth);
  $: previousExpanded = (index: number, nameGroups: EventGroups[]) => {
    let count = 0;
    for (let i = 0; i < index; i++) {
      if (
        exandedGroups.includes(groupNameWithIndex(nameGroups[i][0].name, i))
      ) {
        count++;
      }
    }
    return count;
  };
</script>

<svg
  {x}
  {y}
  viewBox="0 0 {width} {staticHeight || canvasHeight}"
  height={(staticHeight || canvasHeight) / zoomLevel}
  width={width / zoomLevel}
  class="mb-32"
>
  <Line
    startPoint={[0, height]}
    endPoint={[canvasWidth, height]}
    strokeWidth={radius / 2}
  />
  <Text
    point={[canvasWidth / 2 - 8, height - fontSizeRatio]}
    fontSize="24px"
    fontWeight="700">Start</Text
  >
  {#each timeGroups as groups, startIndex}
    {@const nameGroups = getNameGroups(groups)}
    {#each nameGroups as nameGroup, groupIndex}
      {@const group = nameGroup[0]}
      {@const expandedHeight =
        activeIndex !== null && activeIndex < startIndex
          ? activeDetailsHeight
          : 0}
      {@const startY = (startIndex + 2) * height + expandedHeight}
      {console.log(startY)}
      {@const expanded = exandedGroups.includes(
        groupNameWithIndex(group.name, startIndex),
      )}
      {@const expandedIndex =
        groupIndex + previousExpanded(groupIndex, nameGroups)}
      {#if !expanded}
        <CompactGraphVerticalRow
          {group}
          startIndex={expandedIndex}
          count={nameGroup.length}
          y={startY}
          length={(canvasWidth - 100) / nameGroups.length}
          active={isActive(group)}
          onClick={() => onRowClick(nameGroup, startIndex, startY)}
          {expanded}
        />
      {:else}
        {#each nameGroup as group, index}
          {@const y = startY}
          <CompactGraphVerticalRow
            {group}
            startIndex={expandedIndex + index}
            {y}
            length={(canvasWidth - 100) /
              (nameGroups.length + nameGroup.length)}
            active={isActive(group)}
            onClick={() => onEventClick(group, startIndex, y)}
          />
        {/each}
      {/if}
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
  <Line
    startPoint={[0, canvasHeight - height]}
    endPoint={[canvasWidth, canvasHeight - height]}
    strokeWidth={radius / 2}
    pending={workflow.isRunning}
  />
  {#if !workflow.isRunning}
    <Text
      point={[canvasWidth / 2, canvasHeight - height + 1.2 * fontSizeRatio]}
      fontSize="24px"
      fontWeight="700">End</Text
    >
  {/if}
</svg>
