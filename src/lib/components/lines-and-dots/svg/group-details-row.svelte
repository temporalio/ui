<script lang="ts">
  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
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
    getStatusColor,
    mergeEventGroupDetails,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup | undefined = undefined;
  export let event: WorkflowEvent | undefined = undefined;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  let status =
    group?.finalClassification ||
    group?.classification ||
    event?.classification;

  const { gutter, fontSizeRatio, height } = DetailsConfig;
  $: ({ namespace } = $page.params);

  let fetchChildWorkflow;
  let fetchChildTimeline;

  const fetchChildWorkflowForGroup = () => {
    if (!event && group && group.category === 'child-workflow' && namespace) {
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
          status = workflow?.status;
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
  $: groupOrEvent = event ?? group;
  $: title = groupOrEvent.name;
  $: boxHeight = getDetailsBoxHeight(groupOrEvent);
  $: textStartingY = event ? y + fontSizeRatio : height + y + fontSizeRatio;
  $: childTimelineY = y + boxHeight - DetailsChildTimelineHeight;
  $: attributes = mergeEventGroupDetails(groupOrEvent);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  $: groupOrEvent, fetchChildWorkflowForGroup();
  $: width = event ? (4 * canvasWidth) / 5 : canvasWidth;
</script>

<g role="button" tabindex="0" class="relative cursor-pointer">
  <Box point={[x, y]} {width} height={boxHeight} fill="#465A78" />
  {#if !event}
    <Box point={[x, y]} {width} {height} fill="#1E293B" />
    <Box
      point={[x, y]}
      width={x + gutter + 100}
      {height}
      fill={getStatusColor(status)}
    />
    <Text
      point={[x + gutter, y + 0.5 * height]}
      fontWeight="500"
      category="none"
    >
      {status}
    </Text>
    <Text point={[x + 1.5 * gutter + 100, y + 0.5 * height]} fontWeight="500">
      {title}
    </Text>

    <Text
      point={[width - gutter, y + 0.5 * height]}
      fontWeight="500"
      textAnchor="end"
    >
      {formatDistanceAbbreviated({
        start: group?.initialEvent?.eventTime,
        end: group?.lastEvent?.eventTime,
        includeMilliseconds: true,
      })}
    </Text>
  {/if}
  {#each codeBlockAttributes as [key, value], index (key)}
    {@const gridIndex = Math.floor(index / 4)}
    {@const blockX = x + gutter + (index % 4) * (width / 4)}
    {@const y = textStartingY + gridIndex * staticCodeBlockHeight}
    <Text point={[blockX, y]}>{format(key)}</Text>
    <GroupDetailsText
      point={[blockX, y + 1.5 * fontSizeRatio]}
      {key}
      {value}
      {attributes}
      width={width / 2}
    />
  {/each}
  {#each textAttributes as [key, value], index (key)}
    <Text
      point={[
        x + gutter,
        textStartingY +
          staticCodeBlockHeight * Math.ceil(codeBlockAttributes.length / 4) +
          (index + 1) * fontSizeRatio,
      ]}>{format(key)}</Text
    >
    <GroupDetailsText
      point={[
        x + gutter + labelPadding,
        textStartingY +
          staticCodeBlockHeight * Math.ceil(codeBlockAttributes.length / 4) +
          (index + 1) * fontSizeRatio,
      ]}
      {key}
      {value}
      {attributes}
      {width}
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
        {x}
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
