<script lang="ts">
  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { format } from '$lib/utilities/format-camel-case';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    isChildWorkflowExecutionCompletedEvent,
    isChildWorkflowExecutionStartedEvent,
  } from '$lib/utilities/is-event-type';

  import {
    DetailsChildTimelineHeight,
    DetailsConfig,
    getGroupDetailsBoxHeight,
    getStatusColor,
    mergeEventGroupDetails,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  $: status = group?.finalClassification || group?.classification;

  $: {
    if (group?.pendingActivity) {
      if (group.pendingActivity.attempt > 1) {
        status = 'Retrying';
      } else {
        status = 'Pending';
      }
    }
  }

  const { gutter, fontSizeRatio, height } = DetailsConfig;
  $: ({ namespace } = $page.params);

  let fetchChildWorkflow;
  let fetchChildTimeline;

  const fetchChildWorkflowForGroup = () => {
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

  $: title = group.name;
  $: boxHeight = getGroupDetailsBoxHeight(group);
  $: textStartingY = height + y + fontSizeRatio;
  $: childTimelineY = y + boxHeight - DetailsChildTimelineHeight;
  $: attributes = mergeEventGroupDetails(group);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );
  $: group, fetchChildWorkflowForGroup();
  $: width = canvasWidth;
</script>

<g role="button" tabindex="0" class="relative cursor-pointer">
  <Box point={[x, y]} {width} height={boxHeight} fill="#465A78" />
  <Box point={[x, y]} {width} {height} fill="#1E293B" />
  <Box
    point={[x, y]}
    width={gutter + 100}
    {height}
    fill={getStatusColor(status)}
  />
  <Text point={[x + gutter, y + 0.5 * height]} fontWeight="500" category="none">
    {status}
  </Text>
  <Text point={[x + 1.5 * gutter + 100, y + 0.5 * height]} fontWeight="500">
    {title}
  </Text>
  <Text
    point={[x + width - gutter, y + 0.5 * height]}
    fontWeight="500"
    textAnchor="end"
  >
    {formatDistanceAbbreviated({
      start: group?.initialEvent?.eventTime,
      end: group?.lastEvent?.eventTime,
      includeMilliseconds: true,
    })}
  </Text>
  {#each codeBlockAttributes as [key, value], index (key)}
    {@const blockX = x + gutter + 0.5 * width}
    {@const y = textStartingY + index * staticCodeBlockHeight}
    <Text point={[blockX, y]}>{format(key)}</Text>
    <GroupDetailsText
      point={[blockX, y + 1.5 * fontSizeRatio]}
      {key}
      {value}
      {attributes}
      width={0.5 * width - 2 * gutter}
    />
  {/each}
  {#each textAttributes as [key, value], index (key)}
    <foreignObject
      x={x + gutter}
      y={textStartingY + index * fontSizeRatio}
      width={0.5 * width - gutter}
      height={fontSizeRatio}
    >
      <div class="flex gap-1 text-wrap text-sm text-white">
        <div class="w-48">{format(key)}</div>
        <GroupDetailsText
          point={[
            x + gutter + labelPadding,
            textStartingY + index * fontSizeRatio,
          ]}
          {key}
          {value}
          {attributes}
          {width}
        />
      </div>
    </foreignObject>
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
        canvasWidth={0.5 * width}
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
