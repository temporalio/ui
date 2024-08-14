<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type {
    WorkflowEvents,
    WorkflowTaskFailedEvent,
  } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import {
    activeGroupsHeightAboveGroup,
    getGroupDetailsBoxHeight,
    TimelineConfig,
  } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';

  import Dot from './dot.svelte';
  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import WorkflowRow from './workflow-row.svelte';

  export let x = 0;
  export let y = 0;

  export let workflow: WorkflowExecution;
  export let history: WorkflowEvents;
  export let groups: EventGroups;

  export let activeGroups: string[] = [];
  export let zoomLevel: number = 1;
  export let readOnly = false;
  export let workflowTaskFailedError: WorkflowTaskFailedEvent | undefined =
    undefined;

  const { height, gutter, radius } = TimelineConfig;
  let canvasWidth = 0;
  let viewportHeight = 40;

  $: startTime = history[0]?.eventTime || workflow.startTime;
  $: activeDetailsHeight = activeGroups
    .map((id) => {
      const group = groups.find((group) => group.id === id);
      if (!group) return 0;
      return getGroupDetailsBoxHeight(group, canvasWidth);
    })
    .reduce((acc, height) => acc + height, 0);

  $: timelineHeight =
    Math.max(height * (groups.length + 2), 100) + activeDetailsHeight;
  $: canvasHeight = timelineHeight + 100;

  const getWorkflowTaskPosition = (endTime, failedTime) => {
    const workflowDistance = getMillisecondDuration({
      start: startTime,
      end: endTime,
      onlyUnderSecond: false,
    });

    const distance = getMillisecondDuration({
      start: startTime,
      end: failedTime,
      onlyUnderSecond: false,
    });

    const ratio = distance / workflowDistance;
    return Math.round(ratio * (canvasWidth - 2 * gutter)) + gutter;
  };

  const onExpandCollapse = () => {
    if (viewportHeight === 40) {
      viewportHeight = 80;
    } else {
      viewportHeight = 40;
    }
  };
</script>

<div
  class="border-subtle] relative h-80 overflow-auto rounded-xl border-4"
  bind:clientWidth={canvasWidth}
  style="height: {viewportHeight}vh;"
>
  <Button
    size="xs"
    variant="ghost"
    class="sticky left-1 top-1"
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
    >
      <Line
        startPoint={[gutter, 0]}
        endPoint={[gutter, timelineHeight]}
        strokeWidth={radius / 2}
        on:click={() => onExpandCollapse()}
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
      {#if workflowTaskFailedError}
        <Line
          startPoint={[
            getWorkflowTaskPosition(endTime, workflowTaskFailedError.eventTime),
            radius * 2,
          ]}
          endPoint={[
            getWorkflowTaskPosition(endTime, workflowTaskFailedError.eventTime),
            timelineHeight,
          ]}
          strokeWidth={radius / 2}
          classification="Failed"
        />
        <Dot
          r={radius}
          point={[
            getWorkflowTaskPosition(endTime, workflowTaskFailedError.eventTime),
            radius * 2,
          ]}
          active
          classification="Failed"
        />
        <Text
          point={[
            getWorkflowTaskPosition(
              endTime,
              workflowTaskFailedError.eventTime,
            ) +
              radius * 1.5,
            radius * 2,
          ]}
          active
          textAnchor="start"
          category="Failed"
          fontWeight="600"
          config={TimelineConfig}>Workflow Task Failed</Text
        >
      {/if}
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
        {#if activeGroups.includes(group.id)}
          <GroupDetailsRow y={y + 1.33 * radius} {group} {canvasWidth} />
        {/if}
      {/each}
    </svg>
  </EndTimeInterval>
</div>
