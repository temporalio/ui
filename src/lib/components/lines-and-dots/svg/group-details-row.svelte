<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
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

  $: status =
    group?.finalClassification || group?.classification || group?.label;

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

  onMount(() => {
    fetchChildWorkflowForGroup();
  });

  $: width = canvasWidth;
  $: boxHeight = getGroupDetailsBoxHeight(group, width);
  $: isWide = width >= 960;

  $: codeBlockX = x + gutter + (isWide ? 0.666 * width : 0.5 * width);
  $: codeBlockWidth = (isWide ? 0.333 * width : 0.5 * width) - 2 * gutter;

  $: textStartingY = height + y + fontSizeRatio;
  $: textHeight = fontSizeRatio * textAttributes.length * (isWide ? 1 : 2);
  $: textWidth = (isWide ? 0.666 * width : 0.5 * width) - gutter;

  $: childTimelineY = textStartingY + textHeight + fontSizeRatio;
  $: childTimelineWidth = isWide ? 0.666 * width : 0.5 * width;
  $: childTimelineHeight = Math.max(
    DetailsChildTimelineHeight,
    staticCodeBlockHeight * codeBlockAttributes.length - textHeight,
  );

  $: title = group.name;
  $: attributes = mergeEventGroupDetails(group);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );
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
  <Text point={[x + gutter, y + 0.5 * height]} category="none">
    {status ? spaceBetweenCapitalLetters(status) : group.label}
  </Text>
  <Text point={[x + 1.5 * gutter + 100, y + 0.5 * height]}>
    {title}
  </Text>
  <Text point={[x + width - gutter, y + 0.5 * height]} textAnchor="end">
    {formatDistanceAbbreviated({
      start: group?.initialEvent?.eventTime,
      end: group?.lastEvent?.eventTime,
      includeMilliseconds: true,
    })}
  </Text>
  {#each codeBlockAttributes as [key, value], index (key)}
    {@const y = textStartingY + index * staticCodeBlockHeight}
    <Text point={[codeBlockX, y]}>{format(key)}</Text>
    <GroupDetailsText
      point={[codeBlockX, y + 1.5 * fontSizeRatio]}
      {key}
      {value}
      {attributes}
      width={codeBlockWidth}
    />
  {/each}
  <foreignObject
    x={x + gutter}
    y={textStartingY}
    width={textWidth}
    height={textHeight}
  >
    <div class="grid grid-cols-1 gap-x-2 lg:grid-cols-2">
      {#each textAttributes as [key, value], index (key)}
        <div
          class="flex flex-col gap-0 text-sm text-white"
          style="height: {2 * fontSizeRatio}px;"
        >
          <div class="font-semibold leading-3 text-[#C9D9F0]">
            {format(key)}
          </div>
          <div class="text-wrap break-all leading-4">
            <GroupDetailsText
              point={[x + gutter, textStartingY + index * fontSizeRatio]}
              {key}
              {value}
              {attributes}
              {width}
            />
          </div>
        </div>
      {/each}
    </div>
  </foreignObject>
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
        staticHeight={childTimelineHeight}
        {workflow}
        history={childHistory}
        {groups}
        canvasWidth={childTimelineWidth}
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
