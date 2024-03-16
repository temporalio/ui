<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';

  import { TimelineConfig } from '../constants';
  import DrawerWrapper from '../drawer-wrapper.svelte';

  import CompactGraphRow from './compact-graph-row.svelte';

  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let onClick: (group: EventGroup) => void | undefined = undefined;
  export let clearActive: () => void | undefined = undefined;
  export let zoomLevel: number = 1;

  const { gap, gutter, radius } = TimelineConfig;

  $: isActive = (group: EventGroup): boolean => {
    if (activeGroup) {
      return activeGroup.id === group.id;
    }
    return true;
  };

  $: timeGroups = Object.values(
    Object.groupBy(groups, ({ initialEvent }) => initialEvent.timestamp),
  ) as EventGroups[];

  // Need to find the max group size of named groups to determine the canvas height
  $: maxGroupSize = Math.max(...timeGroups.map((group) => group.length));

  $: canvasHeight = Math.max(maxGroupSize * radius * 2, 400);
</script>

<DrawerWrapper {activeGroup} {activeEvent} {clearActive} let:canvasWidth>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight / zoomLevel}
    width={canvasWidth}
  >
    {#each timeGroups as groups, i}
      {@const nameGroups = Object.values(
        Object.groupBy(groups, ({ name }) => name),
      )}
      {#each nameGroups as nameGroup, index}
        {@const group = nameGroup[0]}
        <CompactGraphRow
          {group}
          index={i}
          count={nameGroup.length}
          y={index * gap + gap / 2}
          length={(canvasWidth - 2 * gutter) / timeGroups.length}
          active={isActive(group)}
          onClick={() => onClick && onClick(group)}
        />
      {/each}
    {/each}
  </svg>
</DrawerWrapper>
