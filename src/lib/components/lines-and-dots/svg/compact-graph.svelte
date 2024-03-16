<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';

  import DrawerWrapper from '../drawer-wrapper.svelte';

  import CompactGraphRow from './compact-graph-row.svelte';

  export let groups: EventGroups;

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let onClick: (group: EventGroup) => void | undefined = undefined;
  export let clearActive: () => void | undefined = undefined;
  export let zoomLevel: number = 1;

  $: isActive = (group: EventGroup): boolean => {
    if (activeGroup) {
      return activeGroup.id === group.id;
    }
    return true;
  };

  const canvasHeight = 300;
</script>

<DrawerWrapper {activeGroup} {activeEvent} {clearActive} let:canvasWidth>
  <svg
    viewBox="0 0 {canvasWidth} {canvasHeight}"
    height={canvasHeight / zoomLevel}
    width={canvasWidth}
  >
    {#each groups as group, index (group.id)}
      <CompactGraphRow
        {groups}
        {group}
        {index}
        {canvasWidth}
        active={isActive(group)}
        onClick={() => onClick && onClick(group)}
      />
    {/each}
  </svg>
</DrawerWrapper>
