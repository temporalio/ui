<script lang="ts">
  import { page } from '$app/stores';

  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
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
    getStatusColor,
    mergeEventGroupDetails,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GraphWidget from './graph-widget.svelte';
  import GroupDetailsText from './group-details-text.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  let innerContent;

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

  const { fontSizeRatio, height } = DetailsConfig;
  $: ({ namespace } = $page.params);

  $: width = canvasWidth;
  $: isWide = width >= 960;

  $: textStartingY = height + y + fontSizeRatio;
  $: textHeight =
    fontSizeRatio * textAttributes.length * (isWide ? 1 : 2) + fontSizeRatio;

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
  <Box
    point={[x, y]}
    {width}
    height={innerContent?.clientHeight + height + 2 * fontSizeRatio}
    fill="#465A78"
  />
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
  <foreignObject
    {x}
    y={textStartingY}
    {width}
    height={innerContent?.clientHeight}
    class="px-4 text-white"
  >
    <div bind:this={innerContent} class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 xl:flex-row">
        <div class="flex w-full flex-col gap-2 xl:w-1/2">
          {#each codeBlockAttributes as [key, value] (key)}
            <div>
              <div class="font-medium leading-4 text-slate-100">
                {format(key)}
              </div>
              <GroupDetailsText {key} {value} {attributes} />
            </div>
          {/each}
        </div>
        <div class="w-full xl:w-1/2">
          <div class="grid grid-cols-2 gap-2">
            {#if group.userMetadata?.summary}
              <div>
                <div class="font-medium leading-3 text-purple-200">
                  {translate('common.summary')}
                </div>
                <div class="text-wrap break-all leading-4">
                  <MetadataDecoder
                    value={group?.userMetadata?.summary}
                    fallback={group?.displayName}
                    let:decodedValue
                  >
                    {#key decodedValue}
                      {decodedValue}
                    {/key}
                  </MetadataDecoder>
                </div>
              </div>
            {/if}
            {#each textAttributes as [key, value] (key)}
              <div>
                <div class="font-medium leading-3 text-slate-100">
                  {format(key)}
                </div>
                <div class="text-wrap break-all leading-4">
                  <GroupDetailsText {key} {value} {attributes} />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      {#if childWorkflowStartedEvent}
        <div>
          <div class="font-medium leading-4 text-slate-100">Child Workflow</div>
          {#key group.eventList.length}
            <GraphWidget
              {namespace}
              workflowId={childWorkflowStartedEvent.attributes.workflowExecution
                .workflowId}
              runId={childWorkflowStartedEvent.attributes.workflowExecution
                .runId}
              height={childTimelineHeight}
              width={childTimelineWidth}
              class="overflow-x-hidden rounded-br rounded-tr border-y border-r border-subtle bg-primary"
            />
          {/key}
        </div>
      {/if}
    </div>
  </foreignObject>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
