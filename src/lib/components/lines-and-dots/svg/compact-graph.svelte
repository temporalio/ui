<script lang="ts">
  import groupBy from 'lodash.groupby';

  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import { CompactConfig, getDetailsBoxHeight } from '../constants';

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

  export let onClick: (group: EventGroup) => void | undefined = undefined;

  const { height, gutter, fontSizeRatio } = CompactConfig;
  let exandedGroups = [];
  let activeY = 0;

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
    return Object.values(groupBy(groups, ({ name }) => name)) as EventGroups[];
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
      return getDetailsBoxHeight(group, fontSizeRatio);
    })
    .reduce((acc, height) => acc + height, 0);

  const groupNameWithIndex = (name: string, index: number) =>
    `${index}:${name}`;

  const onRowClick = (groups: EventGroups, startIndex: number, y: number) => {
    if (groups.length === 1) {
      onClick(groups[0]);
      activeY = y;
    } else {
      const name = groupNameWithIndex(groups[0].name, startIndex);
      if (exandedGroups.includes(name)) {
        exandedGroups = exandedGroups.filter((n) => n !== name);
        if (activeGroups.includes(groups[0].id)) {
          onClick(groups[0]);
          activeY = y;
        }
      } else {
        exandedGroups = [...exandedGroups, name];
      }
    }
  };

  const onEventClick = (group: EventGroup, y: number) => {
    onClick(group);
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
</script>

<svg
  {x}
  {y}
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={(staticHeight || canvasHeight) / zoomLevel}
  width={canvasWidth}
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
        length={(canvasWidth - gutter) / timeGroups.length}
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
            length={(canvasWidth - gutter) / timeGroups.length}
            active={isActive(group)}
            onClick={() => onEventClick(group, y)}
          />
        {/each}
      {/if}
    {/each}
    {#if activeGroup}
      <GroupDetailsRow
        group={activeGroup}
        {canvasWidth}
        y={activeY}
        config={CompactConfig}
        view="compact"
      />
    {/if}
  {:else}
    <WorkflowRow {workflow} y={height} length={canvasWidth} active />
  {/each}
</svg>