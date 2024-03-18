<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';

  import { CompactConfig } from '../constants';

  import CompactGraphRow from './compact-graph-row.svelte';

  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let zoomLevel: number = 1;
  export let canvasWidth: number;
  export let onClick: (group: EventGroup) => void | undefined = undefined;

  const { height, gutter } = CompactConfig;
  let exandedGroups = [];

  $: isActive = (group: EventGroup): boolean => {
    if (!activeGroup) return true;
    return activeGroup?.id === group?.id;
  };

  $: timeGroups = Object.values(
    Object.groupBy(groups, ({ initialEvent }) => initialEvent.timestamp),
  ) as EventGroups[];

  const getNameGroups = (groups: EventGroups) => {
    return Object.values(
      Object.groupBy(groups, ({ name }) => name),
    ) as EventGroups[];
  };

  $: maxSegmentSize = () => {
    const groupHeights = timeGroups.map((groups, startIndex) => {
      let totalHeight = 0;
      const nameGroups = getNameGroups(groups);
      nameGroups.forEach((group) => {
        const expanded = exandedGroups.includes(
          groupNameWithIndex(startIndex, group[0].name),
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

  $: canvasHeight = Math.max(maxSegmentSize(), 400);

  const groupNameWithIndex = (index: number, name: string) =>
    `${index}:${name}`;

  const onRowClick = (groups: EventGroups, startIndex: number) => {
    if (groups.length === 1) {
      onClick(groups[0]);
    } else {
      const name = groupNameWithIndex(startIndex, groups[0].name);
      if (exandedGroups.includes(name)) {
        exandedGroups = exandedGroups.filter((n) => n !== name);
        if (activeGroup) {
          onClick(groups[0]);
        }
      } else {
        exandedGroups = [...exandedGroups, name];
      }
    }
  };

  $: getStartYOfGroup = (
    namedGroups: EventGroups[],
    groupIndex: number,
    startIndex: number,
  ) => {
    const expandedIndexesAbove = namedGroups
      .map((group) => group[0].name)
      .filter((name) =>
        exandedGroups.includes(groupNameWithIndex(startIndex, name)),
      )
      .map((name) => namedGroups.findIndex((group) => group[0].name === name))
      .filter((i) => i < groupIndex);

    const expandedSize = expandedIndexesAbove
      .map((i) => namedGroups[i].length)
      .reduce((acc, i) => acc + i, 0);
    return expandedSize * height + groupIndex * height + height / 2;
  };
</script>

<svg
  viewBox="0 0 {canvasWidth} {canvasHeight}"
  height={canvasHeight / zoomLevel}
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
        groupNameWithIndex(startIndex, group.name),
      )}
      <CompactGraphRow
        {group}
        {startIndex}
        count={nameGroup.length}
        y={startY}
        length={(canvasWidth - 2 * gutter) / timeGroups.length}
        active={isActive(group)}
        onClick={() => onRowClick(nameGroup, startIndex)}
        {expanded}
      />
      {#if expanded}
        {#each nameGroup as group, index}
          <CompactGraphRow
            {group}
            {startIndex}
            y={startY + (index + 1) * height}
            length={(canvasWidth - 2 * gutter) / timeGroups.length}
            active={isActive(group)}
            onClick={() => onClick(group)}
          />
        {/each}
      {/if}
    {/each}
  {/each}
</svg>
