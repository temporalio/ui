<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import {
    activeGroupsHeightAboveGroup,
    getGroupDetailsBoxHeight,
    TimelineConfig,
  } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  export let x = 0;
  export let y = 0;
  export let workflow: WorkflowExecution;
  export let groups: EventGroups;
  export let activeGroups: string[] = [];
  export let zoomLevel: number = 1;
  export let readOnly = false;
  export let workflowTaskFailedError: WorkflowTaskFailedEvent | undefined =
    undefined;

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = 0;
  let viewportHeight = 40;
  let scrollY = 0;

  $: startTime = $fullEventHistory[0]?.eventTime || workflow.startTime;
  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      if (!group) return 0;
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);

  $: timelineHeight =
    Math.max(height * (groups.length + 2), 140) + activeDetailsHeight;
  $: canvasHeight = timelineHeight + 140;

  const onExpandCollapse = () => {
    if (viewportHeight === 40) {
      viewportHeight = 80;
    } else {
      viewportHeight = 40;
    }
  };

  const handleScroll = (e) => {
    scrollY = e?.target?.scrollTop;
  };
</script>

<div
  class="border-subtle] relative h-auto overflow-auto rounded-xl border-4"
  bind:clientWidth={canvasWidth}
  style="max-height: {viewportHeight}vh;"
  on:scroll={handleScroll}
>
  <Button
    size="xs"
    variant="ghost"
    class="sticky left-0.5 top-1"
    on:click={onExpandCollapse}
  >
    <Icon
      name={viewportHeight === 40 ? 'chevron-down' : 'chevron-up'}
      x={canvasWidth - 2 * radius}
      y={radius}
    />
  </Button>
  <EndTimeInterval {workflow} {startTime} let:endTime let:duration>
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight / zoomLevel}
      width={canvasWidth}
      class="-mt-8"
      class:error={workflowTaskFailedError}
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
      />
      <TimelineAxis
        x1={gutter - radius / 4}
        x2={canvasWidth - gutter + radius / 4}
        {timelineHeight}
        {startTime}
        {endTime}
        {duration}
      />
      <WorkflowRow {workflow} y={height} length={canvasWidth} />
      {#each groups as group, index (group.id)}
        {@const y =
          (index + 2) * height +
          activeGroupsHeightAboveGroup(
            activeGroups,
            group,
            groups,
            canvasWidth,
            $eventFilterSort,
          )}
        {#if y > scrollY - 2 * height && y < scrollY + viewportHeight * height}
          {#key group.eventList.length}
            <TimelineGraphRow
              {y}
              {group}
              {activeGroups}
              {canvasWidth}
              {startTime}
              {endTime}
              {readOnly}
            />
          {/key}
        {/if}
        {#if activeGroups.includes(group.id)}
          <GroupDetailsRow y={y + 1.33 * radius} {group} {canvasWidth} />
        {/if}
      {/each}
    </svg>
  </EndTimeInterval>
</div>

<style lang="postcss">
  .error {
    @apply bg-danger;
  }
</style>
