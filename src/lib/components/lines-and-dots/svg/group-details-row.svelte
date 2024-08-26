<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import {
    DetailsChildTimelineHeight,
    DetailsConfig,
    getGroupDetailsBoxHeight,
    getStatusColor,
    mergeEventGroupDetails,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GraphWidget from './graph-widget.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Text from './text.svelte';

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

  $: width = canvasWidth;
  $: boxHeight = getGroupDetailsBoxHeight(group, width);
  $: isWide = width >= 960;

  $: codeBlockX = x + gutter + (isWide ? 0.666 * width : 0.5 * width);
  $: codeBlockWidth = (isWide ? 0.333 * width : 0.5 * width) - 2 * gutter;

  $: textStartingY = height + y + fontSizeRatio;
  $: textHeight =
    fontSizeRatio * textAttributes.length * (isWide ? 1 : 2) + fontSizeRatio;
  $: textWidth = (isWide ? 0.666 * width : 0.5 * width) - gutter;

  $: childTimelineY = textStartingY + textHeight;
  $: childTimelineWidth = isWide ? 0.666 * width : 0.5 * width;
  $: childTimelineHeight = Math.max(
    DetailsChildTimelineHeight,
    staticCodeBlockHeight * codeBlockAttributes.length - textHeight,
  );

  $: title = group.displayName;
  $: attributes = mergeEventGroupDetails(group);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  $: childWorkflowStartedEvent =
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent);
</script>

<g role="button" tabindex="0" class="relative z-50 cursor-pointer">
  <Box point={[x, y]} {width} height={boxHeight} fill="#465A78" />
  <Box point={[x, y]} {width} {height} fill="#1E293B" />
  <foreignObject {x} {y} {width} height={fontSizeRatio}>
    <div class="flex h-full items-center justify-between text-sm text-white">
      <div class="flex h-full items-center gap-2">
        <div
          class="px-4 py-1 text-black"
          style="background-color: {getStatusColor(status)};"
        >
          {status ? spaceBetweenCapitalLetters(status) : group.label}
        </div>
        {title}
      </div>
      <div class="flex items-center gap-4">
        {formatDistanceAbbreviated({
          start: group?.initialEvent?.eventTime,
          end: group?.lastEvent?.eventTime,
          includeMilliseconds: true,
        })}
        <button
          class="flex items-center gap-0.5 rounded-t bg-white px-2 text-sm text-black"
          on:click|stopPropagation={() => setActiveGroup(group)}
        >
          {translate('common.close')}<Icon name="close" />
        </button>
      </div>
    </div>
  </foreignObject>
  {#each codeBlockAttributes as [key, value], index (key)}
    {@const y = textStartingY + index * staticCodeBlockHeight}
    <Text point={[codeBlockX, y]} label>{format(key)}</Text>
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
          <div class="font-medium leading-3 text-[#C9D9F0]">
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
  {#if childWorkflowStartedEvent}
    <foreignObject
      {x}
      y={childTimelineY}
      width={childTimelineWidth}
      height={childTimelineHeight}
    >
      {#key group.eventList.length}
        <GraphWidget
          {namespace}
          workflowId={childWorkflowStartedEvent.attributes.workflowExecution
            .workflowId}
          runId={childWorkflowStartedEvent.attributes.workflowExecution.runId}
          height={childTimelineHeight}
          width={childTimelineWidth}
          class="overflow-x-hidden rounded-br rounded-tr border-b-2 border-r-2 border-t-2 border-subtle bg-primary"
        />
      {/key}
    </foreignObject>
  {/if}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
