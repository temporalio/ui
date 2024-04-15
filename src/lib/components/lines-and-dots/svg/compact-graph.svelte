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

  import CompactGraphRow from './compact-graph-row.svelte';
  import GroupDetailsRow from './group-details-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  export let x = 0;
  export let y = 0;
  export let staticHeight = 0;

  export let workflow: WorkflowExecution;
  export let groups: EventGroups;
  export let activeGroups: string[] = [];
  export let zoomLevel: number = 1;
  export let canvasWidth: number;

  const { height, gutter, radius } = CompactConfig;
  let exandedGroups = [];
  let activeY = 0;
  let activeX = 0;

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

  $: maxSegmentSize = () => {
    const groupHeights = timeGroups.map((groups, startIndex) => {
      let totalHeight = height;
      const nameGroups = getNameGroups(groups);
      nameGroups.forEach((group) => {
        const expanded = exandedGroups.includes(
          groupNameWithIndex(group[0].name, startIndex),
        );
        if (group.length === 1 || !expanded) {
          totalHeight += height;
        } else {
          totalHeight += (group.length + 1) * height;
        }
      });
      return totalHeight;
    });
    return Math.max(...groupHeights);
  };

  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);

  const groupNameWithIndex = (name: string, index: number) =>
    `${index}:${name}`;

  const setActiveGroupX = (startIndex: number) => {
    if (width > canvasWidth) {
      if (startIndex * length < width - canvasWidth) {
        activeX = startIndex * length;
      } else {
        activeX = width - canvasWidth;
      }
    }
  };

  const onRowClick = (groups: EventGroups, startIndex: number, y: number) => {
    if (groups.length === 1) {
      setSingleActiveGroup(groups[0]);
      activeY = y;
      setActiveGroupX(startIndex);
    } else {
      clearActives();
      const name = groupNameWithIndex(groups[0].name, startIndex);
      if (exandedGroups.includes(name)) {
        exandedGroups = exandedGroups.filter((n) => n !== name);
        if (activeGroups.includes(groups[0].id)) {
          setSingleActiveGroup(groups[0]);
          setActiveGroupX(startIndex);
          activeY = y;
        }
      } else {
        exandedGroups = [...exandedGroups, name];
      }
    }
  };

  const onEventClick = (group: EventGroup, startIndex: number, y: number) => {
    setSingleActiveGroup(group);
    setActiveGroupX(startIndex);
    activeY = y;
  };

  $: getStartYOfGroup = (
    namedGroups: EventGroups[],
    groupIndex: number,
    startIndex: number,
  ) => {
    const expandedIndexesAbove = namedGroups
      .map((group) => group[0].name)
      .filter((name) =>
        exandedGroups.includes(groupNameWithIndex(name, startIndex)),
      )
      .map((name) => namedGroups.findIndex((group) => group[0].name === name))
      .filter((i) => i < groupIndex);

    const expandedSize = expandedIndexesAbove
      .map((i) => namedGroups[i].length)
      .reduce((acc, i) => acc + i, 0);

    return expandedSize * height + (groupIndex + 1) * height;
  };

  $: canvasHeight = Math.max(maxSegmentSize(), 400) + activeDetailsHeight;
  $: width = Math.max(timeGroups.length * minCompactWidth, canvasWidth);
  $: length = Math.max(minCompactWidth, (width - gutter) / timeGroups.length);
</script>

<svg
  {x}
  {y}
  viewBox="0 0 {width} {staticHeight || canvasHeight}"
  height={(staticHeight || canvasHeight) / zoomLevel}
  width={width / zoomLevel}
>
  {#each timeGroups as groups, startIndex}
    {#each getNameGroups(groups) as nameGroup, groupIndex}
      {@const group = nameGroup[0]}
      {@const startY = getStartYOfGroup(
        getNameGroups(groups),
        groupIndex,
        startIndex,
      )}
      {@const expanded = exandedGroups.includes(
        groupNameWithIndex(group.name, startIndex),
      )}
      <CompactGraphRow
        {group}
        {startIndex}
        count={nameGroup.length}
        y={startY}
        {length}
        active={isActive(group)}
        onClick={() => onRowClick(nameGroup, startIndex, startY)}
        {expanded}
      />
      {#if expanded}
        {#each nameGroup as group, index}
          {@const y = startY + (index + 1) * height}
          <CompactGraphRow
            {group}
            {startIndex}
            {y}
            {length}
            active={isActive(group)}
            onClick={() => onEventClick(group, startIndex, y)}
          />
        {/each}
      {/if}
    {/each}
  {:else}
    <WorkflowRow {workflow} y={height} length={canvasWidth} active />
  {/each}
  {#if activeGroup}
    {#key activeGroup.id}
      <GroupDetailsRow
        group={activeGroup}
        {canvasWidth}
        x={activeX}
        y={activeY + 1.25 * radius}
      />
    {/key}
  {/if}
</svg>
