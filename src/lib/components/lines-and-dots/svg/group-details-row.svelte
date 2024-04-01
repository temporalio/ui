<script lang="ts">
  import { page } from '$app/stores';

  import { groupEvents, isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowEvent } from '$lib/types/events';
  import { format } from '$lib/utilities/format-camel-case';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    isChildWorkflowExecutionCompletedEvent,
    isChildWorkflowExecutionStartedEvent,
  } from '$lib/utilities/is-event-type';

  import {
    DetailsChildTimelineHeight,
    DetailsConfig,
    getDetailsBoxHeight,
    mergeEventGroupDetails,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup;
  export let event: WorkflowEvent | undefined = undefined;
  export let canvasWidth: number;
  export let y: number;

  const { gutter, fontSizeRatio } = DetailsConfig;
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
        }).then(({ workflow }) => {
          result = workflow?.status;
          return workflow;
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

  const labelPadding = 240;
  $: groupOrEvent = group ?? event;
  $: result = isEventGroup(groupOrEvent)
    ? groupOrEvent.finalClassification
    : groupOrEvent.classification;
  $: boxHeight = getDetailsBoxHeight(groupOrEvent);
  $: textStartingY = y + gutter + fontSizeRatio;
  $: childTimelineY = y + boxHeight - DetailsChildTimelineHeight;
  $: attributes = mergeEventGroupDetails(groupOrEvent);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );
</script>

<g role="button" tabindex="0" class="relative cursor-pointer">
  <Box point={[0, y]} width={canvasWidth} height={boxHeight} fill="#465A78" />
  <Box point={[0, y]} width={canvasWidth} height={fontSizeRatio * 1.5} />
  <Text point={[gutter, y + 1 * fontSizeRatio]} fontSize="16" fontWeight="500"
    >{result}</Text
  >
  <Text
    point={[canvasWidth - gutter, y + 1 * fontSizeRatio]}
    fontSize="16"
    fontWeight="500"
    textAnchor="end"
    >{formatDistanceAbbreviated({
      start: group?.initialEvent?.eventTime,
      end: group?.lastEvent?.eventTime,
      includeMilliseconds: true,
    })}
  </Text>
  {#each codeBlockAttributes as [key, value], index (key)}
    {@const gridIndex = Math.floor(index / 2)}
    {@const x = gutter + (index % 2) * (canvasWidth / 2)}
    {@const y = textStartingY + gridIndex * staticCodeBlockHeight}
    <Text point={[x, y]}>{format(key)}</Text>
    <GroupDetailsText
      point={[x, y + 1.5 * fontSizeRatio]}
      {key}
      {value}
      {attributes}
      {canvasWidth}
    />
  {/each}
  {#each textAttributes as [key, value], index (key)}
    <Text
      point={[
        gutter,
        textStartingY +
          staticCodeBlockHeight * Math.ceil(codeBlockAttributes.length / 2) +
          (index + 1) * fontSizeRatio,
      ]}>{format(key)}</Text
    >
    <GroupDetailsText
      point={[
        gutter + labelPadding,
        textStartingY +
          staticCodeBlockHeight * Math.ceil(codeBlockAttributes.length / 2) +
          (index + 1) * fontSizeRatio,
      ]}
      {key}
      {value}
      {attributes}
      {canvasWidth}
    />
  {/each}
  {#if fetchChildWorkflow && fetchChildTimeline}
    {#await Promise.all( [fetchChildWorkflow, fetchChildTimeline], ) then [workflow, childHistory]}
      {@const groups = groupEvents(
        childHistory,
        'ascending',
        workflow?.pendingActivities,
      )}
      <TimelineGraph
        x={0}
        y={childTimelineY}
        staticHeight={DetailsChildTimelineHeight}
        {workflow}
        history={childHistory}
        {groups}
        {canvasWidth}
      />
    {/await}
  {/if}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
