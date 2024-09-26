<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import { timeFormat } from '$lib/stores/time-format';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';

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
  export let readOnly = false;
  export let workflowTaskFailedError: WorkflowTaskFailedEvent | undefined =
    undefined;

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = 0;
  let viewportHeight = 360;
  let scrollY = 0;

  $: filteredGroups = getFailedOrPendingGroups(groups, $eventStatusFilter);
  $: startTime = $fullEventHistory[0]?.eventTime || workflow.startTime;
  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = filteredGroups.find((group) => group.id === id);
      if (!group) return 0;
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);

  $: timelineHeight =
    Math.max(height * (filteredGroups.length + 2), 120) + activeDetailsHeight;
  $: canvasHeight = timelineHeight + 140;

  const onExpandCollapse = () => {
    if (viewportHeight === 360) {
      viewportHeight = 800;
    } else {
      viewportHeight = 360;
    }
  };

  const handleScroll = (e) => {
    scrollY = e?.target?.scrollTop;
  };
</script>

<div
  class="relative h-auto overflow-auto border-b-2 border-subtle"
  bind:clientWidth={canvasWidth}
  style="max-height: {viewportHeight}px;"
  on:scroll={handleScroll}
>
  <EndTimeInterval {workflow} {startTime} let:endTime let:duration>
    <Button
      size="xs"
      variant="ghost"
      class="sticky left-0.5 top-1"
      on:click={onExpandCollapse}
    >
      <Icon
        name={viewportHeight === 360 ? 'chevron-down' : 'chevron-up'}
        x={canvasWidth - 2 * radius}
        y={radius}
      />
    </Button>
    <div
      class="sticky {timelineHeight < viewportHeight
        ? 'top-[160px]'
        : viewportHeight === 360
        ? 'top-[260px]'
        : 'top-[700px]'}"
      class:invisible={!!activeGroups.length}
    >
      <div class="flex w-full justify-between text-xs">
        <p class="w-60 -translate-x-24 rotate-90">
          {formatDate(startTime, $timeFormat)}
        </p>
        <p class="w-60 translate-x-24 rotate-90">
          {formatDate(endTime, $timeFormat)}
        </p>
      </div>
    </div>
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
      class="-mt-12"
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
        {duration}
      />
      <WorkflowRow {workflow} y={height} length={canvasWidth} />
      {#each filteredGroups as group, index (group.id)}
        {@const y =
          (index + 2) * height +
          activeGroupsHeightAboveGroup(
            activeGroups,
            group,
            filteredGroups,
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
