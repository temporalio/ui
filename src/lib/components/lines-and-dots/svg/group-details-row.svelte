<script lang="ts">
  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowEvent } from '$lib/types/events';
  import { format } from '$lib/utilities/format-camel-case';
  import {
    isChildWorkflowExecutionCompletedEvent,
    isChildWorkflowExecutionStartedEvent,
  } from '$lib/utilities/is-event-type';

  import {
    DetailsChildTimelineHeight,
    getDetailsBoxHeight,
    type GraphConfig,
    type GraphView,
    mergeEventGroupDetails,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup;
  export let event: WorkflowEvent | undefined = undefined;
  export let canvasWidth: number;
  export let y: number;
  export let config: GraphConfig;
  export let view: GraphView;

  const { radius, fontSizeRatio, gutter } = config;
  $: ({ namespace } = $page.params);

  let fetchChildWorkflow;
  let fetchChildTimeline;

  $: fetchChildWorkflowForGroup(group);

  const fetchChildWorkflowForGroup = (group: EventGroup) => {
    if (group && group.category === 'child-workflow' && namespace) {
      const completedEvent = group.eventList.find(
        isChildWorkflowExecutionCompletedEvent,
      );
      const startedEvent = group.eventList.find(
        isChildWorkflowExecutionStartedEvent,
      );
      const childEvent = completedEvent ?? startedEvent;
      if (childEvent) {
        const childWorkflowId =
          childEvent.attributes.workflowExecution.workflowId;
        const childRunId = childEvent.attributes.workflowExecution.runId;
        fetchChildWorkflow = fetchWorkflow({
          namespace,
          workflowId: childWorkflowId,
          runId: childRunId,
        });
        fetchChildTimeline = fetchAllEvents({
          namespace,
          workflowId: childWorkflowId,
          runId: childRunId,
        });
      }
    } else {
      fetchChildWorkflow = undefined;
      fetchChildTimeline = undefined;
    }
  };

  $: groupOrEvent = group ?? event;
  $: boxHeight = getDetailsBoxHeight(groupOrEvent, fontSizeRatio);
  $: startingX = gutter + radius / 2;
  $: textStartingY = fetchChildTimeline
    ? y + radius + DetailsChildTimelineHeight
    : y + radius;
  $: attributes = mergeEventGroupDetails(groupOrEvent);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );
</script>

<g
  role="button"
  tabindex="0"
  class="relative cursor-pointer"
  height={boxHeight}
>
  <Box
    point={[0, y + radius]}
    width={canvasWidth}
    height={boxHeight}
    fill="#1E293B"
  />
  {#if fetchChildWorkflow && fetchChildTimeline}
    {#await Promise.all( [fetchChildWorkflow, fetchChildTimeline], ) then [childWorkflow, childHistory]}
      {@const groups = groupEvents(
        childHistory,
        'ascending',
        childWorkflow?.pendingActivities,
      )}
      <TimelineGraph
        x={0}
        y={y + radius}
        staticHeight={DetailsChildTimelineHeight}
        workflow={childWorkflow.workflow}
        history={childHistory}
        {groups}
        {canvasWidth}
      />
    {/await}
  {/if}
  {#each codeBlockAttributes as [key, value], index (key)}
    <Text point={[startingX, textStartingY + (index + 1) * 2 * fontSizeRatio]}
      >{format(key)}</Text
    >
    <GroupDetailsText
      point={[startingX + 240, textStartingY + (index + 1) * 2 * fontSizeRatio]}
      {key}
      {value}
      {attributes}
      {config}
      {canvasWidth}
    />
  {/each}
  {#each textAttributes as [key, value], index (key)}
    <Text
      point={[
        startingX,
        textStartingY +
          2 * fontSizeRatio * codeBlockAttributes.length +
          (index + 2) * fontSizeRatio,
      ]}>{format(key)}</Text
    >
    <GroupDetailsText
      point={[
        startingX + 240,
        textStartingY +
          2 * fontSizeRatio * codeBlockAttributes.length +
          (index + 2) * fontSizeRatio,
      ]}
      {key}
      {value}
      {attributes}
      {config}
      {canvasWidth}
    />
  {/each}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
