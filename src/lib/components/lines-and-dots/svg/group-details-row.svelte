<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { format } from '$lib/utilities/format-camel-case';
  import {
    isChildWorkflowExecutionCompletedEvent,
    isChildWorkflowExecutionStartedEvent,
  } from '$lib/utilities/is-event-type';

  import {
    DetailsChildTimelineHeight,
    getDetailsBoxHeight,
    type GraphConfig,
    mergeEventGroupDetails,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let y: number;
  export let config: GraphConfig;
  export let onClick: () => void;

  const { radius, gutter, fontSizeRatio } = config;

  $: ({ namespace } = $page.params);

  let fetchChildWorkflow;
  let fetchChildTimeline;

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
          sort: 'ascending',
        });
        startingY += DetailsChildTimelineHeight;
      }
    } else {
      fetchChildWorkflow = undefined;
      fetchChildTimeline = undefined;
    }
  };

  onMount(() => {
    fetchChildWorkflowForGroup(group);
  });

  $: attributes = mergeEventGroupDetails(group);
  $: boxHeight = getDetailsBoxHeight(group, fontSizeRatio);
  $: boxStartY = y + radius;
  $: startingX = 1.5 * gutter;
  let startingY = y + 1.5 * radius;
</script>

<g
  role="button"
  tabindex="0"
  on:click={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  height={boxHeight}
>
  <Box
    point={[gutter, boxStartY]}
    width={canvasWidth - 2 * gutter - 4}
    height={boxHeight}
    fill="#1E293B"
  />
  {#await Promise.all( [fetchChildWorkflow, fetchChildTimeline], ) then [childWorkflow, childHistory]}
    {#if childWorkflow && childHistory}
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
    {/if}
  {/await}
  {#each Object.entries(attributes) as [key, value], index (key)}
    <Text
      fontSize="14px"
      point={[startingX, startingY + (index + 1) * fontSizeRatio]}
      >{format(key)}</Text
    >
    <GroupDetailsText
      point={[startingX + 250, startingY + (index + 1) * fontSizeRatio]}
      {key}
      {value}
      {attributes}
    />
  {/each}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
