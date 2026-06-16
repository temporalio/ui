<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { activeGroupHeight, activeGroups } from '$lib/stores/active-events';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';

  import { TimelineConfig } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  interface Props {
    x?: number;
    y?: number;
    workflow: WorkflowExecution;
    groups: EventGroups;
    viewportHeight: number | undefined;
    readOnly?: boolean;
    error?: boolean;
  }

  let {
    x = 0,
    y = 0,
    workflow,
    groups,
    viewportHeight,
    readOnly = false,
    error = false,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = $state(0);
  let scrollY = $state(0);

  const expandedGroupHeight = $derived(readOnly ? 0 : $activeGroupHeight);
  const filteredGroups = $derived(
    getFailedOrPendingGroups(groups, $eventStatusFilter),
  );
  const firstStartTime = $derived.by(() => {
    const firstEventTime = $fullEventHistory[0]?.eventTime;

    if (!firstEventTime) {
      return workflow.executionTime;
    }

    return firstEventTime < workflow.executionTime
      ? firstEventTime
      : workflow.executionTime;
  });

  const startTime = $derived(
    (!isWorkflowDelayed(workflow) && firstStartTime) || workflow.startTime,
  );
  const timelineHeight = $derived(
    Math.max(height * (filteredGroups.length + 2), 120) + expandedGroupHeight,
  );
  const canvasHeight = $derived(timelineHeight + 120);

  const handleScroll = (e: Event) => {
    scrollY = (e?.target as HTMLElement)?.scrollTop;
  };

  const groupIndexMap = $derived(
    new Map(filteredGroups.map((g, i) => [g.id, i])),
  );

  // Single Set for O(1) active-group lookup inside the each loop.
  const activeGroupSet = $derived(new Set($activeGroups));

  // Precompute every row's y position in one pass.
  const groupYPositions = $derived(
    filteredGroups.map((_, index) => {
      const hasActiveAbove = $activeGroups?.some((id) => {
        const activeIndex = groupIndexMap.get(id);
        return activeIndex !== undefined && activeIndex < index;
      });
      return (index + 2) * height + (hasActiveAbove ? expandedGroupHeight : 0);
    }),
  );

  // Pre-filter to visible rows so {#each} never iterates 10k items on every
  // reactive update — only the ~50 rows actually in the viewport are processed.
  const visibleGroups = $derived(
    filteredGroups
      .map((group, index) => ({ group, index, y: groupYPositions[index] }))
      .filter(
        ({ y }) =>
          !viewportHeight ||
          (y > scrollY - 2 * height && y < scrollY + viewportHeight * height),
      ),
  );
</script>

<div
  id="event-history-timeline-graph"
  class="relative h-auto overflow-auto border border-t-0 border-subtle bg-primary [contain:layout_style] [scrollbar-gutter:stable]"
  style="content-visibility:auto;contain-intrinsic-size:auto 400px;{viewportHeight
    ? `max-height:${viewportHeight}px;`
    : ''}"
  bind:clientWidth={canvasWidth}
  onscroll={handleScroll}
>
  <EndTimeInterval
    {workflow}
    {startTime}
    let:endTime
    let:duration
    let:currentTime
  >
    <div
      class="pointer-events-none sticky top-[120px]"
      class:invisible={!!$activeGroups.length}
    >
      <div class="flex w-full justify-between text-xs">
        <p class="w-60 -translate-x-24 rotate-90">
          {$timestamp(startTime, { format: 'short' })}
        </p>
        <p class="w-60 translate-x-24 rotate-90">
          {$timestamp(endTime, { format: 'short' })}
        </p>
      </div>
    </div>
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
      class="-mt-4"
      class:error
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
        duration={duration ?? 0}
      />
      <WorkflowRow {workflow} y={height} length={canvasWidth} />
      {#each visibleGroups as { group, y } (group.id)}
        {#key group.eventList.length}
          <TimelineGraphRow
            {y}
            {group}
            {canvasWidth}
            {startTime}
            {endTime}
            {readOnly}
          />
        {/key}
        {#if !readOnly && activeGroupSet.has(group.id)}
          <GroupDetailsRow
            y={y + 1.33 * radius}
            {group}
            {canvasWidth}
            endTime={workflow?.endTime ? endTime : currentTime}
          />
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
