<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import { DetailsConfig, TimelineConfig } from '../constants';

  import Box from './box.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup;
  export let index: number;
  export let canvasWidth: number;
  export let onClick: () => void;

  const { height, gutter, radius } = TimelineConfig;
  const { boxHeight } = DetailsConfig;

  $: y = (index + 1) * height;

  $: timelineWidth = canvasWidth - 2 * gutter;

  $: ({ namespace } = $page.params);

  let fetchChildWorkflow;
  let fetchChildTimeline;

  const fetchChildWorkflowForGroup = (group: EventGroup) => {
    if (group && group.category === 'child-workflow' && namespace) {
      const completedEvent = group.eventList.find(
        isChildWorkflowExecutionStartedEvent,
      );
      if (completedEvent) {
        const childWorkflowId =
          completedEvent.attributes.workflowExecution.workflowId;
        const childRunId = completedEvent.attributes.workflowExecution.runId;
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
      }
    } else {
      fetchChildWorkflow = undefined;
      fetchChildTimeline = undefined;
    }
  };

  onMount(() => {
    fetchChildWorkflowForGroup(group);
  });
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  height={boxHeight}
>
  <Box
    point={[gutter, y + radius]}
    width={timelineWidth}
    height={boxHeight}
    fill="#fff"
  ></Box>
  <Text active category="icon" point={[gutter, y + 2 * radius]}
    >{JSON.stringify(group, undefined, 2)}</Text
  >
  {#await Promise.all( [fetchChildWorkflow, fetchChildTimeline], ) then [childWorkflow, childHistory]}
    {#if childWorkflow && childHistory}
      {@const groups = groupEvents(
        childHistory,
        'ascending',
        childWorkflow?.pendingActivities,
      )}
      <TimelineGraph
        x={0}
        {y}
        staticHeight={boxHeight}
        workflow={childWorkflow.workflow}
        history={childHistory}
        {groups}
        {canvasWidth}
      />
    {/if}
  {/await}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
