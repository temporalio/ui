<script lang="ts">
  import { page } from '$app/stores';

  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import Button from '$lib/holocene/button.svelte';
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

  import { getStatusColor, mergeEventGroupDetails } from '../constants';

  import GraphWidget from './graph-widget.svelte';
  import GroupDetailsText from './group-details-text.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  let innerContent;
  $: contentHeight = innerContent?.clientHeight;

  $: status =
    group?.finalClassification || group?.classification || group?.label;
  $: ({ namespace } = $page.params);
  $: width = canvasWidth;
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

  $: duration = formatDistanceAbbreviated({
    start: group?.initialEvent?.eventTime,
    end: group?.lastEvent?.eventTime,
    includeMilliseconds: true,
  });

  $: {
    if (group?.pendingActivity) {
      if (group.pendingActivity.attempt > 1) {
        status = 'Retrying';
      } else {
        status = 'Pending';
      }
    }
  }
</script>

<g role="button" tabindex="0" class="relative z-50">
  <foreignObject {x} {y} {width} height={contentHeight}>
    <div bind:this={innerContent} class="flex flex-col">
      <div
        class="relative flex h-full items-center justify-between bg-slate-200 text-sm dark:bg-slate-800"
      >
        <div class="flex h-full items-center gap-4">
          <div
            class="px-4 py-1.5 text-black"
            style="background-color: {getStatusColor(status)};"
          >
            {status ? spaceBetweenCapitalLetters(status) : group.label}
          </div>
          {title}
          {#if duration}
            <div class="flex items-center gap-1">
              <Icon name="clock" />
              {duration}
            </div>
          {/if}
        </div>
        <div class="flex items-center gap-4">
          <Button
            variant="ghost"
            size="xs"
            on:click={() => setActiveGroup(group)}
            >{translate('common.close')} <Icon name="close" /></Button
          >
        </div>
      </div>
      <div class="surface-primary flex flex-col gap-4 p-4 xl:flex-row">
        <div class="flex w-full flex-col gap-2 xl:w-1/2">
          {#each codeBlockAttributes as [key, value] (key)}
            <div>
              <div class="font-medium leading-4 text-subtle">
                {format(key)}
              </div>
              <GroupDetailsText {key} {value} {attributes} />
            </div>
          {/each}
        </div>
        <div class="w-full xl:w-1/2">
          <div class="grid grid-cols-2 gap-3">
            {#if group.userMetadata?.summary}
              <MetadataDecoder
                value={group?.userMetadata?.summary}
                let:decodedValue
              >
                {#if decodedValue}
                  <div>
                    <div class="font-medium leading-3 text-brand">
                      {translate('common.summary')}
                    </div>
                    <div class="text-wrap break-all leading-4">
                      {#key decodedValue}
                        {decodedValue}
                      {/key}
                    </div>
                  </div>
                {/if}
              </MetadataDecoder>
            {/if}
            {#each textAttributes as [key, value] (key)}
              <div>
                <div class="font-medium leading-3 text-subtle">
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
        <div class="surface-primary px-4">
          <div class="font-medium leading-4 text-subtle">Child Workflow</div>
          {#key group.eventList.length}
            <GraphWidget
              {namespace}
              workflowId={childWorkflowStartedEvent.attributes.workflowExecution
                .workflowId}
              runId={childWorkflowStartedEvent.attributes.workflowExecution
                .runId}
              height={200}
              class="surface-primary overflow-x-hidden border border-subtle"
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
